require('dotenv').config(); // 환경 변수 로드

const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 미들웨어 설정
app.use(express.urlencoded({ extended: true })); // POST 데이터 파싱
app.use(express.json()); // JSON 데이터 파싱

// 세션 설정
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS에서만 쿠키 전송
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24시간
    }
}));

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// 라우팅
app.get('/', (req, res) => {
    res.render('franchise', { title: 'Texas Papa - Franchise', activePage: 'franchise' });
});

app.get('/brand', (req, res) => {
    res.render('brand', { title: 'Texas Papa - Brand', activePage: 'brand' });
});

app.get('/company', (req, res) => {
    res.render('company', { title: 'Texas Papa - Company', activePage: 'brand' });
});

app.get('/menu', (req, res) => {
    res.render('menu', { title: 'Texas Papa - Menu', activePage: 'menu' });
});

app.get('/franchise', (req, res) => {
    res.render('franchise', { title: 'Texas Papa - Franchise', activePage: 'franchise' });
});

// 커뮤니티 섹션 라우팅
app.get('/community/:tab?', async (req, res) => {
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
        const db = require('./config/database');

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

            // 조회수 증가는 상세 페이지에서만 처리
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
            }
        });
    } catch (error) {
        console.error('커뮤니티 조회 오류:', error);
        res.render('community/index', {
            title: `${titles[tab] || '커뮤니티'} | Texas Papa`,
            activePage: 'community',
            currentTab: tab,
            posts: [],
            pagination: { currentPage: 1, totalPages: 1, totalPosts: 0 }
        });
    }
});

app.get('/location', (req, res) => {
    res.render('location', { title: 'Texas Papa - Location', activePage: 'brand' });
});

// SEO 파일 제공
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

app.get('/rss.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'public', 'rss.xml'));
});

// 관리자 라우터 연결
const adminRouter = require('./routes/admin');
app.use('/console', adminRouter);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
