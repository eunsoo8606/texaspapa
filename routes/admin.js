const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../config/database');
const { requireAuth, redirectIfAuthenticated } = require('../middleware/auth');

// ===========================
// 로그인 페이지
// ===========================
router.get('/', redirectIfAuthenticated, (req, res) => {
    res.render('admin/login', { title: '관리자 로그인', error: null });
});

// ===========================
// 로그인 처리
// ===========================
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 입력 검증
        if (!username || !password) {
            return res.render('admin/login', {
                title: '관리자 로그인',
                error: '아이디와 비밀번호를 입력해주세요.'
            });
        }

        // 데이터베이스에서 사용자 조회 (Prepared Statement로 SQL Injection 방지)
        // admin_id 또는 admin_name으로 로그인 가능
        const [users] = await db.query(
            `SELECT * FROM admins 
             WHERE (admin_id = ? OR admin_name = ?) 
             AND is_active = 1`,
            [username, username]
        );

        // 사용자가 없거나 비활성화된 경우
        if (users.length === 0) {
            return res.render('admin/login', {
                title: '관리자 로그인',
                error: '아이디 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        const user = users[0];

        // 비밀번호 검증 (bcrypt)
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.render('admin/login', {
                title: '관리자 로그인',
                error: '아이디 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        // 세션에 사용자 정보 저장 (비밀번호는 저장하지 않음)
        req.session.adminUser = {
            id: user.id,
            adminId: user.admin_id,
            adminName: user.admin_name,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.company_id
        };

        // 마지막 로그인 시간 업데이트
        await db.query(
            'UPDATE admins SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        // 대시보드로 리다이렉트
        res.redirect('/console/dashboard');

    } catch (error) {
        console.error('로그인 오류:', error);
        res.render('admin/login', {
            title: '관리자 로그인',
            error: '로그인 처리 중 오류가 발생했습니다.'
        });
    }
});

// ===========================
// 로그아웃
// ===========================
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('로그아웃 오류:', err);
        }
        res.redirect('/console');
    });
});

// ===========================
// 대시보드 (인증 필요)
// ===========================
router.get('/dashboard', requireAuth, async (req, res) => {
    try {
        // 통계 데이터 조회 (추후 구현)
        const stats = {
            totalPosts: 0,
            totalInquiries: 0,
            totalFranchises: 0,
            recentActivities: []
        };

        res.render('admin/dashboard', {
            title: '대시보드',
            user: req.session.adminUser,
            stats,
            currentPage: 'dashboard'
        });
    } catch (error) {
        console.error('대시보드 로드 오류:', error);
        res.status(500).send('대시보드를 불러오는 중 오류가 발생했습니다.');
    }
});

// ===========================
// 게시판 관리 (인증 필요)
// ===========================
router.get('/board/:type', requireAuth, async (req, res) => {
    const { type } = req.params;
    const boardTypes = {
        notice: '공지사항',
        event: '이벤트',
        faq: 'FAQ',
        voice: '고객의소리',
        inquiry: '문의게시판'
    };

    const boardTitle = boardTypes[type] || '게시판';

    try {
        const companyId = req.session.adminUser.companyId;

        // boards 테이블에서 company_id와 category로 게시판 ID 조회
        const [boardResult] = await db.query(
            'SELECT id FROM boards WHERE company_id = ? AND category = ? LIMIT 1',
            [companyId, type]
        );

        if (boardResult.length === 0) {
            return res.status(404).send('게시판을 찾을 수 없습니다.');
        }

        const boardId = boardResult[0].id;

        // 쿼리 파라미터
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const searchType = req.query.searchType || 'all';

        // 검색 조건
        let searchCondition = '';
        let searchParams = [];

        if (search) {
            if (searchType === 'title') {
                searchCondition = 'AND title LIKE ?';
                searchParams.push(`%${search}%`);
            } else if (searchType === 'content') {
                searchCondition = 'AND content LIKE ?';
                searchParams.push(`%${search}%`);
            } else {
                searchCondition = 'AND (title LIKE ? OR content LIKE ?)';
                searchParams.push(`%${search}%`, `%${search}%`);
            }
        }

        // 게시글 목록 조회
        const [posts] = await db.query(
            `SELECT post_no, title, writer, views, create_dt 
             FROM posts 
             WHERE board_id = ? ${searchCondition}
             ORDER BY top_yn DESC, create_dt DESC 
             LIMIT ? OFFSET ?`,
            [boardId, ...searchParams, limit, offset]
        );

        // 총 게시글 수
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM posts WHERE board_id = ? ${searchCondition}`,
            [boardId, ...searchParams]
        );

        const totalPosts = countResult[0].total;
        const totalPages = Math.ceil(totalPosts / limit);

        // 페이지네이션
        const maxPageButtons = 5;
        let startPage = Math.max(1, page - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        // 뷰에서 사용할 형식으로 변환
        const formattedPosts = posts.map(post => ({
            id: post.post_no,
            title: post.title,
            author: post.writer,
            views: post.views || 0,
            created_at: post.create_dt
        }));

        res.render('admin/board', {
            title: boardTitle,
            user: req.session.adminUser,
            boardType: type,
            boardTitle,
            currentPage: `board-${type}`,
            posts: formattedPosts,
            pagination: {
                currentPage: page,
                totalPages,
                totalPosts,
                startPage,
                endPage,
                hasPrev: page > 1,
                hasNext: page < totalPages
            },
            search: {
                keyword: search,
                type: searchType
            }
        });
    } catch (error) {
        console.error('게시판 조회 오류:', error);
        res.status(500).send('게시판을 불러오는 중 오류가 발생했습니다.');
    }
});

// ===========================
// 게시글 작성 페이지 (인증 필요)
// ===========================
router.get('/board/:type/write', requireAuth, (req, res) => {
    const { type } = req.params;
    const boardTypes = {
        notice: '공지사항',
        event: '이벤트',
        faq: 'FAQ',
        voice: '고객의소리',
        inquiry: '문의게시판'
    };

    const boardTitle = boardTypes[type] || '게시판';

    res.render('admin/board-write', {
        title: `${boardTitle} 작성`,
        user: req.session.adminUser,
        boardType: type,
        boardTitle,
        currentPage: `board-${type}`
    });
});

// ===========================
// 게시글 등록 처리 (인증 필요)
// ===========================
router.post('/board/:type/write', requireAuth, async (req, res) => {
    const { type } = req.params;
    const { title, content, top_yn } = req.body;

    try {
        if (!title || !content) {
            return res.status(400).send('제목과 내용을 입력해주세요.');
        }

        const companyId = req.session.adminUser.companyId;

        // boards 테이블에서 company_id와 category로 게시판 ID 조회
        const [boardResult] = await db.query(
            'SELECT id FROM boards WHERE company_id = ? AND category = ? LIMIT 1',
            [companyId, type]
        );

        if (boardResult.length === 0) {
            return res.status(400).send('게시판을 찾을 수 없습니다.');
        }

        const boardId = boardResult[0].id;
        const author = req.session.adminUser.name || req.session.adminUser.adminName;
        const topYn = top_yn === 'Y' ? 'Y' : 'N';
        const createIp = req.ip || req.connection.remoteAddress;

        // posts 테이블에 저장
        await db.query(
            `INSERT INTO posts (board_id, title, content, writer, top_yn, create_ip, create_dt, views) 
             VALUES (?, ?, ?, ?, ?, ?, NOW(), 0)`,
            [boardId, title, content, author, topYn, createIp]
        );

        res.redirect(`/console/board/${type}`);

    } catch (error) {
        console.error('게시글 등록 오류:', error);
        res.status(500).send('게시글 등록 중 오류가 발생했습니다.');
    }
});

// ===========================
// 게시글 상세 페이지 (인증 필요)
// ===========================
router.get('/board/:type/:id', requireAuth, async (req, res) => {
    const { type, id } = req.params;
    const boardTypes = {
        notice: '공지사항',
        event: '이벤트',
        faq: 'FAQ',
        voice: '고객의소리',
        inquiry: '문의게시판'
    };

    const boardTitle = boardTypes[type] || '게시판';

    try {
        const companyId = req.session.adminUser.companyId;

        // boards 테이블에서 company_id와 category로 게시판 ID 조회
        const [boardResult] = await db.query(
            'SELECT id FROM boards WHERE company_id = ? AND category = ? LIMIT 1',
            [companyId, type]
        );

        if (boardResult.length === 0) {
            return res.status(404).send('게시판을 찾을 수 없습니다.');
        }

        const boardId = boardResult[0].id;

        // posts 테이블에서 게시글 조회
        const [posts] = await db.query(
            `SELECT post_no, title, content, writer, create_dt, top_yn, views 
             FROM posts 
             WHERE post_no = ? AND board_id = ?`,
            [id, boardId]
        );

        if (posts.length === 0) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }

        const post = {
            id: posts[0].post_no,
            title: posts[0].title,
            content: posts[0].content,
            author: posts[0].writer,
            created_at: posts[0].create_dt,
            top_yn: posts[0].top_yn,
            views: posts[0].views || 0
        };

        res.render('admin/board-detail', {
            title: post.title,
            user: req.session.adminUser,
            boardType: type,
            boardTitle,
            currentPage: `board-${type}`,
            post
        });

    } catch (error) {
        console.error('게시글 조회 오류:', error);
        res.status(500).send('게시글을 불러오는 중 오류가 발생했습니다.');
    }
});

// ===========================
// 게시글 수정 페이지 (인증 필요)
// ===========================
router.get('/board/:type/:id/edit', requireAuth, async (req, res) => {
    const { type, id } = req.params;
    const boardTypes = {
        notice: '공지사항',
        event: '이벤트',
        faq: 'FAQ',
        voice: '고객의소리',
        inquiry: '문의게시판'
    };

    const boardTitle = boardTypes[type] || '게시판';

    try {
        const companyId = req.session.adminUser.companyId;

        // boards 테이블에서 company_id와 category로 게시판 ID 조회
        const [boardResult] = await db.query(
            'SELECT id FROM boards WHERE company_id = ? AND category = ? LIMIT 1',
            [companyId, type]
        );

        if (boardResult.length === 0) {
            return res.status(404).send('게시판을 찾을 수 없습니다.');
        }

        const boardId = boardResult[0].id;

        // posts 테이블에서 게시글 조회
        const [posts] = await db.query(
            `SELECT post_no, title, content, writer, create_dt, top_yn 
             FROM posts 
             WHERE post_no = ? AND board_id = ?`,
            [id, boardId]
        );

        if (posts.length === 0) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }

        const post = {
            id: posts[0].post_no,
            title: posts[0].title,
            content: posts[0].content,
            author: posts[0].writer,
            created_at: posts[0].create_dt,
            top_yn: posts[0].top_yn
        };

        res.render('admin/board-edit', {
            title: `${boardTitle} 수정`,
            user: req.session.adminUser,
            boardType: type,
            boardTitle,
            currentPage: `board-${type}`,
            post
        });

    } catch (error) {
        console.error('게시글 조회 오류:', error);
        res.status(500).send('게시글을 불러오는 중 오류가 발생했습니다.');
    }
});

// ===========================
// 게시글 수정 처리 (인증 필요)
// ===========================
router.post('/board/:type/:id/edit', requireAuth, async (req, res) => {
    const { type, id } = req.params;
    const { title, content, top_yn } = req.body;

    try {
        if (!title || !content) {
            return res.status(400).send('제목과 내용을 입력해주세요.');
        }

        const companyId = req.session.adminUser.companyId;

        // boards 테이블에서 company_id와 category로 게시판 ID 조회
        const [boardResult] = await db.query(
            'SELECT id FROM boards WHERE company_id = ? AND category = ? LIMIT 1',
            [companyId, type]
        );

        if (boardResult.length === 0) {
            return res.status(400).send('게시판을 찾을 수 없습니다.');
        }

        const boardId = boardResult[0].id;
        const topYn = top_yn === 'Y' ? 'Y' : 'N';
        const updateIp = req.ip || req.connection.remoteAddress;

        // posts 테이블 업데이트
        const [result] = await db.query(
            `UPDATE posts 
             SET title = ?, content = ?, top_yn = ?, update_ip = ?, update_dt = NOW() 
             WHERE post_no = ? AND board_id = ?`,
            [title, content, topYn, updateIp, id, boardId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }

        res.redirect(`/console/board/${type}/${id}`);

    } catch (error) {
        console.error('게시글 수정 오류:', error);
        res.status(500).send('게시글 수정 중 오류가 발생했습니다.');
    }
});


// ===========================
// 게시글 삭제 처리 (인증 필요)
// ===========================
router.post('/board/:type/:id/delete', requireAuth, async (req, res) => {
    const { type, id } = req.params;

    try {
        const companyId = req.session.adminUser.companyId;

        // boards 테이블에서 company_id와 category로 게시판 ID 조회
        const [boardResult] = await db.query(
            'SELECT id FROM boards WHERE company_id = ? AND category = ? LIMIT 1',
            [companyId, type]
        );

        if (boardResult.length === 0) {
            return res.status(400).send('게시판을 찾을 수 없습니다.');
        }

        const boardId = boardResult[0].id;

        // posts 테이블에서 삭제
        const [result] = await db.query(
            'DELETE FROM posts WHERE post_no = ? AND board_id = ?',
            [id, boardId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }

        res.redirect(`/console/board/${type}`);

    } catch (error) {
        console.error('게시글 삭제 오류:', error);
        res.status(500).send('게시글 삭제 중 오류가 발생했습니다.');
    }
});


// ===========================
// 문의하기 관리 (인증 필요)
// ===========================
router.get('/inquiry', requireAuth, (req, res) => {
    res.render('admin/inquiry', {
        title: '문의하기 관리',
        user: req.session.adminUser,
        currentPage: 'inquiry'
    });
});

// ===========================
// 가맹점 관리 (인증 필요)
// ===========================
router.get('/franchise', requireAuth, (req, res) => {
    res.render('admin/franchise', {
        title: '가맹점 관리',
        user: req.session.adminUser,
        currentPage: 'franchise'
    });
});

// ===========================
// 초기 관리자 계정 생성 (개발용)
// ===========================
router.get('/setup', async (req, res) => {
    try {
        // 이미 관리자가 있는지 확인
        const [existingUsers] = await db.query('SELECT COUNT(*) as count FROM admins');

        if (existingUsers[0].count > 0) {
            return res.send('관리자 계정이 이미 존재합니다.');
        }

        // 기본 관리자 계정 생성
        const adminId = 'admin';
        const adminName = 'admin';
        const password = 'admin123';
        const name = '관리자';
        const email = 'admin@texaspapa.co.kr';

        // 비밀번호 해싱
        const passwordHash = await bcrypt.hash(password, 10);

        // 데이터베이스에 삽입
        await db.query(
            `INSERT INTO admins 
            (admin_id, admin_name, password, email, name, role, is_active) 
            VALUES (?, ?, ?, ?, ?, 'super_admin', 1)`,
            [adminId, adminName, passwordHash, email, name]
        );

        res.send(`
            <h1>관리자 계정 생성 완료</h1>
            <p>아이디: ${adminId}</p>
            <p>비밀번호: ${password}</p>
            <p><a href="/console">로그인 페이지로 이동</a></p>
        `);

    } catch (error) {
        console.error('관리자 계정 생성 오류:', error);
        res.status(500).send('관리자 계정 생성 중 오류가 발생했습니다: ' + error.message);
    }
});

module.exports = router;
