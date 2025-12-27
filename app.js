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
    res.render('index', { title: 'Texas Papa - Welcome' });
});

app.get('/brand', (req, res) => {
    res.render('brand', { title: 'Texas Papa - Brand' });
});

app.get('/company', (req, res) => {
    res.render('company', { title: 'Texas Papa - Company' });
});

app.get('/franchise', (req, res) => {
    res.render('franchise', { title: 'Texas Papa - Franchise' });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
