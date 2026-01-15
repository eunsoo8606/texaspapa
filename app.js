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

// 커뮤니티 섹션 라우팅 (단일 페이지)
app.get('/community/:tab?', (req, res) => {
    const tab = req.params.tab || 'notice'; // 기본값은 공지사항
    const titles = {
        notice: '공지사항',
        event: '이벤트',
        faq: 'FAQ',
        voice: '고객의소리',
        inquiry: '문의게시판'
    };

    res.render('community/index', {
        title: `${titles[tab] || '커뮤니티'} | Texas Papa`,
        activePage: 'community',
        currentTab: tab
    });
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

// 관리자 콘솔 라우팅
app.get('/console', (req, res) => {
    // 이미 로그인된 경우 대시보드로 리다이렉트 (추후 구현)
    // if (req.session.isAdmin) {
    //     return res.redirect('/console/dashboard');
    // }
    res.render('admin/login', { title: '관리자 로그인', error: null });
});

// 로그인 처리 (추후 데이터베이스 연동 구현)
app.post('/console/login', (req, res) => {
    const { username, password } = req.body;

    // TODO: 데이터베이스에서 사용자 확인 및 비밀번호 검증
    // 임시로 에러 메시지 반환
    res.render('admin/login', {
        title: '관리자 로그인',
        error: '로그인 기능은 추후 구현 예정입니다.'
    });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
