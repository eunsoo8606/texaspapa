const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');
const { encrypt, stripPhone } = require('../utils/crypto');
const { sendInquiryNotification } = require('../utils/email');

// 커뮤니티 목록 조회
router.get('/:tab?', async (req, res) => {
    const tab = req.params.tab || 'notice';
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const titles = {
        notice: '공지사항',
        event: '이벤트',
        faq: 'FAQ',
        voice: '고객의소리',
        inquiry: '문의게시판'
    };

    try {
        // boards 테이블에서 해당 게시판 ID 조회 (company_id 2번 - Texas Papa)
        const [boardResult] = await db.query(
            'SELECT id FROM boards WHERE company_id = 2 AND category = ? LIMIT 1',
            [tab]
        );

        let posts = [];
        let totalPosts = 0;
        let totalPages = 1;

        if (boardResult.length > 0) {
            const boardId = boardResult[0].id;

            // 게시글 목록 조회 (상단 고정 우선, 최신순)
            [posts] = await db.query(
                `SELECT post_no, title, writer, views, create_dt, top_yn
                 FROM posts
                 WHERE board_id = ?
                 ORDER BY top_yn DESC, create_dt DESC
                 LIMIT ? OFFSET ?`,
                [boardId, limit, offset]
            );

            // 총 게시글 수
            const [countResult] = await db.query(
                'SELECT COUNT(*) as total FROM posts WHERE board_id = ?',
                [boardId]
            );
            totalPosts = countResult[0].total;
            totalPages = Math.ceil(totalPosts / limit);
        }

        res.render('community/index', {
            title: `${titles[tab] || '커뮤니티'} | Texas Papa`,
            activePage: 'community',
            currentTab: tab,
            posts: posts,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalPosts: totalPosts
            },
            query: req.query
        });
    } catch (error) {
        console.error('커뮤니티 조회 오류:', error);
        res.render('community/index', {
            title: `${titles[tab] || '커뮤니티'} | Texas Papa`,
            activePage: 'community',
            currentTab: tab,
            posts: [],
            pagination: { currentPage: 1, totalPages: 1, totalPosts: 0 },
            query: req.query
        });
    }
});

// 문의 작성 페이지
router.get('/:tab/write', (req, res) => {
    const { tab } = req.params;

    if (tab !== 'inquiry' && tab !== 'voice') {
        return res.redirect(`/community/${tab}`);
    }

    const titles = {
        voice: '고객의소리',
        inquiry: '문의게시판'
    };

    res.render('community/inquiry_write', {
        title: `${titles[tab]} 작성 | Texas Papa`,
        activePage: 'community',
        boardType: tab,
        boardTitle: titles[tab]
    });
});

// 문의 작성 처리
router.post('/:tab/write', async (req, res) => {
    const { tab } = req.params;
    const { author_name, author_email, author_phone, password, title, content } = req.body;

    try {
        if (tab !== 'inquiry' && tab !== 'voice') {
            return res.status(400).send('잘못된 요청입니다.');
        }

        if (!author_name || !author_email || !author_phone || !password || !title || !content) {
            return res.status(400).send('모든 필수 항목을 입력해주세요.');
        }

        const [boardResult] = await db.query(
            'SELECT id FROM boards WHERE company_id = 2 AND category = ? LIMIT 1',
            [tab]
        );

        if (boardResult.length === 0) {
            return res.status(400).send('게시판을 찾을 수 없습니다.');
        }

        const boardId = boardResult[0].id;
        const passwordHash = await bcrypt.hash(password, 10);
        const createIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const strippedPhone = stripPhone(author_phone);
        const encryptedName = encrypt(author_name);
        const encryptedEmail = encrypt(author_email);
        const encryptedPhone = encrypt(strippedPhone);

        await db.query(
            `INSERT INTO posts 
            (board_id, title, content, writer, author_name, author_email, author_phone, password, status, create_ip, create_dt, views, top_yn) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW(), 0, 'N')`,
            [boardId, title, content, author_name, encryptedName, encryptedEmail, encryptedPhone, passwordHash, createIp]
        );

        try {
            await sendInquiryNotification({
                author_name,
                author_email,
                author_phone,
                title,
                content,
                boardType: tab
            });
        } catch (emailError) {
            console.error('이메일 발송 실패:', emailError);
        }

        res.redirect(`/community/${tab}?success=1`);

    } catch (error) {
        console.error('문의 작성 오류:', error);
        res.status(500).send('문의 작성 중 오류가 발생했습니다.');
    }
});

// 게시글 상세 조회 이동
router.get('/:tab/:id', async (req, res) => {
    const { tab, id } = req.params;

    const titles = {
        notice: '공지사항',
        event: '이벤트',
        faq: 'FAQ',
        voice: '고객의소리',
        inquiry: '문의게시판'
    };

    try {
        if (tab === 'inquiry' || tab === 'voice') {
            return res.render('community/password_check', {
                title: `비밀번호 확인 | Texas Papa`,
                activePage: 'community',
                boardType: tab,
                boardTitle: titles[tab],
                postNo: id,
                error: null
            });
        }

        // 일반 게시판 (공지사항, 이벤트, FAQ) 상세 조회
        // 조회수 증가
        await db.query('UPDATE posts SET views = views + 1 WHERE post_no = ?', [id]);

        // 게시글 데이터 조회
        const [posts] = await db.query(
            'SELECT * FROM posts WHERE post_no = ?',
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }

        const post = posts[0];

        res.render('community/detail', {
            title: `${post.title} | Texas Papa`,
            activePage: 'community',
            currentTab: tab,
            boardTitle: titles[tab],
            post: post
        });

    } catch (error) {
        console.error('게시글 상세 조회 오류:', error);
        res.status(500).send('게시글을 불러오는 중 오류가 발생했습니다.');
    }
});

// 비밀번호 검증 및 상세 조회
router.post('/:tab/:id/verify', async (req, res) => {
    const { tab, id } = req.params;
    const { password } = req.body;

    try {
        const [posts] = await db.query(
            'SELECT * FROM posts WHERE post_no = ?',
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }

        const post = posts[0];
        const isPasswordValid = await bcrypt.compare(password, post.password);

        if (!isPasswordValid) {
            const titles = {
                voice: '고객의소리',
                inquiry: '문의게시판'
            };

            return res.render('community/password_check', {
                title: `비밀번호 확인 | Texas Papa`,
                activePage: 'community',
                boardType: tab,
                boardTitle: titles[tab],
                postNo: id,
                error: '비밀번호가 일치하지 않습니다.'
            });
        }

        const [replies] = await db.query(
            'SELECT * FROM replies WHERE post_no = ? ORDER BY created_at DESC LIMIT 1',
            [id]
        );

        const reply = replies.length > 0 ? replies[0] : null;

        res.render('community/inquiry_detail', {
            title: `${post.title} | Texas Papa`,
            activePage: 'community',
            boardType: tab,
            post: post,
            reply: reply
        });

    } catch (error) {
        console.error('비밀번호 검증 오류:', error);
        res.status(500).send('비밀번호 검증 중 오류가 발생했습니다.');
    }
});

module.exports = router;
