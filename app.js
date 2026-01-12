const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
