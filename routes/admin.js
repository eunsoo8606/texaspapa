const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const db = require('../config/database');
const { requireAuth, redirectIfAuthenticated } = require('../middleware/auth');
const { decrypt, formatPhone } = require('../utils/crypto');

// ===========================
// 이미지 업로드 설정 (Multer)
// ===========================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/board/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'board-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp)'));
    }
});

// 이미지 업로드 API
router.post('/api/upload/image', requireAuth, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '파일이 업로드되지 않았습니다.' });
        }
        const imageUrl = `/uploads/board/${req.file.filename}`;
        res.json({ success: true, url: imageUrl });
    } catch (error) {
        console.error('이미지 업로드 오류:', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
});

// ===========================
// 로그인 페이지
// ===========================
router.get('/', redirectIfAuthenticated, (req, res) => {
    let errorMessage = null;

    if (req.query.error === 'session_expired') {
        errorMessage = '[세션 만료] 로그인 세션이 만료되었거나 존재하지 않습니다. 다시 로그인해주세요.';
    }

    res.render('admin/login', { title: '관리자 로그인', error: errorMessage });
});

// ===========================
// 로그인 처리
// ===========================
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        console.log('🔐 로그인 시도:', username);

        // 입력 검증
        if (!username || !password) {
            console.log('❌ 입력 검증 실패: 아이디 또는 비밀번호 누락');
            return res.render('admin/login', {
                title: '관리자 로그인',
                error: '[1단계 실패] 아이디와 비밀번호를 입력해주세요.'
            });
        }

        // 데이터베이스에서 사용자 조회 (Prepared Statement로 SQL Injection 방지)
        // admin_id 또는 admin_name으로 로그인 가능
        console.log('📊 데이터베이스 조회 시작...');
        const [users] = await db.query(
            `SELECT * FROM admins 
             WHERE (admin_id = ? OR admin_name = ?) 
             AND is_active = 1`,
            [username, username]
        );

        // 사용자가 없거나 비활성화된 경우
        if (users.length === 0) {
            console.log('❌ 사용자를 찾을 수 없음:', username);
            return res.render('admin/login', {
                title: '관리자 로그인',
                error: '[2단계 실패] 아이디 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        const user = users[0];
        console.log('✅ 사용자 찾음:', user.admin_id);

        // 비밀번호 검증 (bcrypt)
        console.log('🔑 비밀번호 검증 중...');
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            console.log('❌ 비밀번호 불일치');
            return res.render('admin/login', {
                title: '관리자 로그인',
                error: '[3단계 실패] 아이디 또는 비밀번호가 올바르지 않습니다.'
            });
        }

        console.log('✅ 비밀번호 검증 성공');

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

        console.log('💾 세션에 사용자 정보 저장:', req.session.adminUser);

        // 마지막 로그인 시간 업데이트
        await db.query(
            'UPDATE admins SET last_login = NOW() WHERE id = ?',
            [user.id]
        );

        console.log('📅 마지막 로그인 시간 업데이트 완료');

        // 세션 저장을 Promise로 래핑
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error('❌ 세션 저장 실패:', err);
                    reject(new Error('[4단계 실패] 세션 저장 오류: ' + err.message));
                } else {
                    console.log('✅ 세션 저장 완료');
                    console.log('📦 세션 ID:', req.sessionID);
                    console.log('📦 세션 데이터:', req.session);
                    resolve();
                }
            });
        });

        console.log('🚀 대시보드로 리다이렉트');
        res.redirect('/console/dashboard');

    } catch (error) {
        console.error('💥 로그인 오류:', error);
        console.error('💥 오류 스택:', error.stack);
        res.render('admin/login', {
            title: '관리자 로그인',
            error: error.message || '로그인 처리 중 오류가 발생했습니다.'
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
        const companyId = req.session.adminUser.companyId;

        // 1. 공지사항 게시글 수 조회 (회사 ID 2로 고정 - 텍사스파파)
        const [noticeCount] = await db.query(
            'SELECT COUNT(*) as count FROM posts p JOIN boards b ON p.board_id = b.id WHERE b.company_id = 2 AND b.category = "notice"',
            []
        );

        // 2. 가맹 문의 건수 조회 (회사 ID 2로 고정)
        const [inquiryCount] = await db.query(
            'SELECT COUNT(*) as count FROM consultation WHERE company_id = 2',
            []
        );

        // 3. 가맹점 수 조회 (회사 ID 2로 고정)
        const [franchiseCount] = await db.query(
            'SELECT COUNT(*) as count FROM stores WHERE company_id = 2',
            []
        );

        // 4. 오늘 방문자 수 조회 (IP 기준 중복 제거, 회사 ID 2로 고정)
        const [visitorCount] = await db.query(
            'SELECT COUNT(DISTINCT ip) as count FROM visitor_logs WHERE company_id = 2 AND DATE(created_at) = CURDATE()',
            []
        );

        // 5. 오늘 유입 경로별 통계 조회 (Top 5)
        const [sourceStats] = await db.query(
            `SELECT 
                CASE 
                    WHEN utm_source IS NOT NULL AND utm_source != '' THEN utm_source
                    WHEN referrer LIKE '%naver.com%' THEN '네이버'
                    WHEN referrer LIKE '%google.com%' THEN '구글'
                    WHEN referrer LIKE '%daum.net%' THEN '다음'
                    WHEN referrer LIKE '%instagram.com%' THEN '인터넷강좌'
                    WHEN referrer LIKE '%facebook.com%' THEN '페이스북'
                    WHEN referrer LIKE '%youtube.com%' THEN '유튜브'
                    WHEN referrer IS NULL OR referrer = '' OR referrer = 'null' THEN '직접입력/기타'
                    ELSE SUBSTRING_INDEX(REPLACE(REPLACE(referrer, 'http://', ''), 'https://', ''), '/', 1)
                END as source,
                COUNT(DISTINCT ip) as count
            FROM visitor_logs 
            WHERE company_id = 2 AND DATE(created_at) = CURDATE()
            GROUP BY source
            ORDER BY count DESC
            LIMIT 5`,
            []
        );

        // 6. 최근 30일간 일별 방문자 통계 조회
        const [dailyStats] = await db.query(
            `SELECT 
                DATE_FORMAT(created_at, '%Y-%m-%d') as date,
                COUNT(DISTINCT ip) as count
            FROM visitor_logs 
            WHERE company_id = 2 
            AND created_at >= DATE_SUB(CURDATE(), INTERVAL 29 DAY)
            GROUP BY date
            ORDER BY date ASC`,
            []
        );

        // 7. 오늘 시간대별 방문 분포 조회 (0-23시)
        const [hourlyStats] = await db.query(
            `SELECT 
                HOUR(created_at) as hour,
                COUNT(DISTINCT ip) as count
            FROM visitor_logs 
            WHERE company_id = 2 AND DATE(created_at) = CURDATE()
            GROUP BY hour
            ORDER BY hour ASC`,
            []
        );

        // 8. 오늘 인기 페이지 TOP 5 조회 (관리자 및 시스템 페이지 제외)
        const [pageStatsRaw] = await db.query(
            `SELECT 
                page_url,
                COUNT(*) as view_count
            FROM visitor_logs 
            WHERE company_id = 2 
            AND DATE(created_at) = CURDATE()
            AND page_url NOT LIKE '/console%'
            AND page_url NOT LIKE '%sitemap.xml%'
            AND page_url NOT LIKE '%/.well-known/%'
            AND page_url NOT LIKE '%.php%'
            AND page_url NOT LIKE '%robots.txt%'
            GROUP BY page_url
            ORDER BY view_count DESC
            LIMIT 10`, // 매핑 후 TOP 5를 추리기 위해 일단 10개 조회
            []
        );

        // URL -> 메뉴명 매핑 (상세화)
        const menuMapping = {
            '/': '홈 (메인)',
            '/brand': '브랜드 소개',
            '/company': '브랜드 소개',
            '/menu': '메뉴 소개',
            '/franchise': '가맹 문의/신청',
            '/location': '매장 안내',
            '/board/notice': '공지사항',
            '/community/notice': '공지사항',
            '/board/event': '이벤트',
            '/community/event': '이벤트'
        };

        const pageStatsMap = new Map();

        pageStatsRaw.forEach(page => {
            // 쿼리 스트링 제거 (예: /menu?cat=crepe -> /menu)
            const cleanUrl = page.page_url.split('?')[0];
            const displayName = menuMapping[cleanUrl] || (cleanUrl === '' ? '홈 (메인)' : cleanUrl);

            if (pageStatsMap.has(displayName)) {
                pageStatsMap.set(displayName, pageStatsMap.get(displayName) + page.view_count);
            } else {
                pageStatsMap.set(displayName, page.view_count);
            }
        });

        // 다시 배열로 변환 후 상위 5개 추출
        const pageStats = Array.from(pageStatsMap.entries())
            .map(([display, count]) => ({
                page_display: display,
                view_count: count
            }))
            .sort((a, b) => b.view_count - a.view_count)
            .slice(0, 5);

        const stats = {
            totalPosts: noticeCount[0].count,
            totalInquiries: inquiryCount[0].count,
            totalFranchises: franchiseCount[0].count,
            todayVisitors: visitorCount[0].count,
            visitorSources: sourceStats,
            dailyVisitors: dailyStats,
            hourlyVisitors: hourlyStats,
            popularPages: pageStats,
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
            views: posts[0].views || 0,
            author_name: decrypt(posts[0].author_name),
            author_email: decrypt(posts[0].author_email),
            author_phone: formatPhone(decrypt(posts[0].author_phone)),
            status: posts[0].status
        };

        // 답변 조회 (문의게시판, 고객의소리만)
        let reply = null;
        if (type === 'inquiry' || type === 'voice') {
            const [replies] = await db.query(
                'SELECT * FROM replies WHERE post_no = ? ORDER BY created_at DESC LIMIT 1',
                [id]
            );
            reply = replies.length > 0 ? replies[0] : null;
        }

        res.render('admin/board-detail', {
            title: post.title,
            user: req.session.adminUser,
            boardType: type,
            boardTitle,
            currentPage: `board-${type}`,
            post,
            reply
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
router.get('/inquiry', requireAuth, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM consultation ORDER BY created_at DESC'
        );

        const inquiries = rows.map(item => ({
            ...item,
            name: decrypt(item.name),
            email: decrypt(item.email),
            phone: formatPhone(decrypt(item.phone))
        }));

        res.render('admin/inquiry', {
            title: '문의하기 관리',
            user: req.session.adminUser,
            currentPage: 'inquiry',
            inquiries
        });
    } catch (error) {
        console.error('문의 내역 조회 오류:', error);
        res.status(500).send('문의 내역을 불러오는 중 오류가 발생했습니다.');
    }
});

// ===========================
// 문의하기 상태 변경 (인증 필요)
// ===========================
router.post('/inquiry/:id/status', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query(
            'UPDATE consultation SET status = ?, updated_at = NOW() WHERE consultation_id = ?',
            [status, id]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('상태 업데이트 오류:', error);
        res.status(500).json({ success: false, message: '상태 업데이트 중 오류가 발생했습니다.' });
    }
});
router.post('/board/:type/:id/reply', requireAuth, async (req, res) => {
    const { type, id } = req.params;
    const { reply_content } = req.body;

    try {
        const db = require('../config/database');

        // 입력 검증
        if (!reply_content || reply_content.trim() === '') {
            return res.status(400).send('답변 내용을 입력해주세요.');
        }

        // 기존 답변 확인
        const [existingReplies] = await db.query(
            'SELECT * FROM replies WHERE post_no = ?',
            [id]
        );

        const isNewReply = existingReplies.length === 0; // 새 답변 여부 확인

        if (existingReplies.length > 0) {
            // 답변 수정
            await db.query(
                'UPDATE replies SET reply_content = ?, updated_at = NOW() WHERE post_no = ?',
                [reply_content, id]
            );
        } else {
            // 새 답변 등록
            await db.query(
                'INSERT INTO replies (post_no, reply_content, admin_id, created_at) VALUES (?, ?, ?, NOW())',
                [id, reply_content, req.session.adminUser.id]
            );
        }

        // 게시글 상태를 'answered'로 업데이트
        await db.query(
            'UPDATE posts SET status = ? WHERE post_no = ?',
            ['answered', id]
        );

        // 사용자에게 답변 완료 이메일 발송 (첫 등록 시에만, 문의게시판/고객의소리만)
        if (isNewReply && (type === 'inquiry' || type === 'voice')) {
            try {
                // 게시글 정보 조회
                const [posts] = await db.query(
                    'SELECT title, author_name, author_email FROM posts WHERE post_no = ?',
                    [id]
                );

                if (posts.length > 0 && posts[0].author_email) {
                    const { sendReplyNotification } = require('../utils/email');
                    await sendReplyNotification({
                        userEmail: posts[0].author_email,
                        userName: posts[0].author_name,
                        postTitle: posts[0].title,
                        replyContent: reply_content,
                        boardType: type
                    });
                }
            } catch (emailError) {
                console.error('이메일 발송 실패 (답변은 정상 등록됨):', emailError);
            }
        }

        // 상세 페이지로 리다이렉트
        res.redirect(`/console/board/${type}/${id}`);

    } catch (error) {
        console.error('답변 저장 오류:', error);
        res.status(500).send('답변 저장 중 오류가 발생했습니다.');
    }
});

// ===========================
// 가맹점 관리 (인증 필요)
// ===========================
router.get('/franchise', requireAuth, async (req, res) => {
    try {
        const companyId = req.session.adminUser.companyId;

        // stores 테이블에서 본인 브랜드에 해당하는 가맹점 조회
        const [stores] = await db.query(
            'SELECT * FROM stores WHERE company_id = ? ORDER BY id DESC',
            [companyId]
        );

        res.render('admin/franchise', {
            title: '가맹점 관리',
            user: req.session.adminUser,
            currentPage: 'franchise',
            stores
        });
    } catch (error) {
        console.error('가맹점 조회 오류:', error);
        res.status(500).send('가맹점 정보를 불러오는 중 오류가 발생했습니다.');
    }
});

// 가맹점 추가 페이지
router.get('/franchise/add', requireAuth, (req, res) => {
    res.render('admin/franchise-write', {
        title: '가맹점 추가',
        user: req.session.adminUser,
        currentPage: 'franchise',
        mode: 'add',
        store: null
    });
});

// 가맹점 추가 처리
router.post('/franchise/add', requireAuth, async (req, res) => {
    const { name, address, phone, lat, lng, use_yn } = req.body;
    try {
        const companyId = req.session.adminUser.companyId;
        await db.query(
            'INSERT INTO stores (company_id, name, address, phone, lat, lng, use_yn) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [companyId, name, address, phone, lat, lng, use_yn || 'Y']
        );
        res.redirect('/console/franchise');
    } catch (error) {
        console.error('가맹점 추가 오류:', error);
        res.status(500).send('가맹점 추가 중 오류가 발생했습니다.');
    }
});

// 가맹점 수정 페이지
router.get('/franchise/edit/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const [stores] = await db.query('SELECT * FROM stores WHERE id = ?', [id]);
        if (stores.length === 0) return res.status(404).send('매장을 찾을 수 없습니다.');

        res.render('admin/franchise-write', {
            title: '가맹점 수정',
            user: req.session.adminUser,
            currentPage: 'franchise',
            mode: 'edit',
            store: stores[0]
        });
    } catch (error) {
        console.error('가맹점 수정 페이지 로드 오류:', error);
        res.status(500).send('수정 페이지를 불러오는 중 오류가 발생했습니다.');
    }
});

// 가맹점 수정 처리
router.post('/franchise/edit/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, lat, lng, use_yn } = req.body;
    try {
        await db.query(
            'UPDATE stores SET name = ?, address = ?, phone = ?, lat = ?, lng = ?, use_yn = ? WHERE id = ?',
            [name, address, phone, lat, lng, use_yn || 'Y', id]
        );
        res.redirect('/console/franchise');
    } catch (error) {
        console.error('가맹점 수정 처리 오류:', error);
        res.status(500).send('가맹점 정보 수정 중 오류가 발생했습니다.');
    }
});

// 가맹점 삭제 처리
router.post('/franchise/delete/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM stores WHERE id = ?', [id]);
        res.redirect('/console/franchise');
    } catch (error) {
        console.error('가맹점 삭제 오류:', error);
        res.status(500).send('가맹점 삭제 중 오류가 발생했습니다.');
    }
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

// ===========================
// 팝업 관리 (인증 필요)
// ===========================

// 팝업 이미지 업로드 설정 (Multer)
const popupStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/popup/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'popup-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadPopup = multer({
    storage: popupStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname || mimetype) {
            return cb(null, true);
        }
        cb(new Error('이미지 파일만 업로드 가능합니다. (jpg, png, gif, webp)'));
    }
});

// 팝업 목록
router.get('/popup', requireAuth, async (req, res) => {
    try {
        const companyId = req.session.adminUser.companyId;
        const [popups] = await db.query(
            'SELECT * FROM popups WHERE company_id = ? ORDER BY created_at DESC',
            [companyId]
        );

        res.render('admin/popup-list', {
            title: '팝업 관리',
            user: req.session.adminUser,
            currentPage: 'popup',
            popups
        });
    } catch (error) {
        console.error('팝업 목록 조회 오류:', error);
        res.status(500).send('팝업 목록을 불러오는 중 오류가 발생했습니다.');
    }
});

// 팝업 등록 페이지
router.get('/popup/add', requireAuth, (req, res) => {
    res.render('admin/popup-write', {
        title: '팝업 등록',
        user: req.session.adminUser,
        currentPage: 'popup',
        mode: 'add',
        popup: null
    });
});

// 팝업 등록 처리
router.post('/popup/add', requireAuth, uploadPopup.single('popup_file'), async (req, res) => {
    let { title, content, image_url, link_url, target, width, height, pos_top, pos_left, start_date, end_date, is_active } = req.body;

    // 파일 업로드 시 경로 수정
    if (req.file) {
        image_url = '/uploads/popup/' + req.file.filename;
    }

    try {
        const companyId = req.session.adminUser.companyId;
        await db.query(
            `INSERT INTO popups 
            (company_id, title, content, image_url, link_url, target, width, height, pos_top, pos_left, start_date, end_date, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [companyId, title, content, image_url, link_url, target, width || 400, height || 500, pos_top || 100, pos_left || 100, start_date || null, end_date || null, is_active === 'on' ? 1 : 0]
        );
        res.redirect('/console/popup');
    } catch (error) {
        console.error('팝업 등록 오류:', error);
        res.status(500).send('팝업 등록 중 오류가 발생했습니다.');
    }
});

// 팝업 수정 페이지
router.get('/popup/edit/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const companyId = req.session.adminUser.companyId;
        const [popups] = await db.query(
            'SELECT * FROM popups WHERE id = ? AND company_id = ?',
            [id, companyId]
        );

        if (popups.length === 0) {
            return res.status(404).send('팝업을 찾을 수 없습니다.');
        }

        res.render('admin/popup-write', {
            title: '팝업 수정',
            user: req.session.adminUser,
            currentPage: 'popup',
            mode: 'edit',
            popup: popups[0]
        });
    } catch (error) {
        console.error('팝업 조회 오류:', error);
        res.status(500).send('팝업 정보를 불러오는 중 오류가 발생했습니다.');
    }
});

// 팝업 수정 처리
router.post('/popup/edit/:id', requireAuth, uploadPopup.single('popup_file'), async (req, res) => {
    const { id } = req.params;
    let { title, content, image_url, link_url, target, width, height, pos_top, pos_left, start_date, end_date, is_active } = req.body;

    // 파일 업로드 시 경로 수정
    if (req.file) {
        image_url = '/uploads/popup/' + req.file.filename;
    }

    try {
        const companyId = req.session.adminUser.companyId;
        await db.query(
            `UPDATE popups SET 
            title = ?, content = ?, image_url = ?, link_url = ?, target = ?, 
            width = ?, height = ?, pos_top = ?, pos_left = ?, 
            start_date = ?, end_date = ?, is_active = ? 
            WHERE id = ? AND company_id = ?`,
            [title, content, image_url, link_url, target, width || 400, height || 500, pos_top || 100, pos_left || 100, start_date || null, end_date || null, is_active === 'on' ? 1 : 0, id, companyId]
        );
        res.redirect('/console/popup');
    } catch (error) {
        console.error('팝업 수정 오류:', error);
        res.status(500).send('팝업 수정 중 오류가 발생했습니다.');
    }
});

// 팝업 삭제
router.post('/popup/delete/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const companyId = req.session.adminUser.companyId;
        await db.query('DELETE FROM popups WHERE id = ? AND company_id = ?', [id, companyId]);
        res.redirect('/console/popup');
    } catch (error) {
        console.error('팝업 삭제 오류:', error);
        res.status(500).send('팝업 삭제 중 오류가 발생했습니다.');
    }
});

// 팝업 상태 토글 (AJAX)
router.post('/popup/status', requireAuth, async (req, res) => {
    const { id, is_active } = req.body;
    try {
        const companyId = req.session.adminUser.companyId;
        await db.query(
            'UPDATE popups SET is_active = ? WHERE id = ? AND company_id = ?',
            [is_active ? 1 : 0, id, companyId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('팝업 상태 변경 오류:', error);
        res.status(500).json({ success: false, message: '상태 변경 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
