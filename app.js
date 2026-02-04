require('dotenv').config(); // 환경 변수 로드
const express = require('express');
const compression = require('compression');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Vercel 프록시 신뢰 설정 (HTTPS 쿠키 작동을 위해 필수)
app.set('trust proxy', 1);

// 미들웨어 설정
app.use(compression());
app.use(express.urlencoded({ extended: true })); // POST 데이터 파싱
app.use(express.json()); // JSON 데이터 파싱

// MySQL 세션 스토어 설정 (Vercel 서버리스 환경 대응)
const sessionStoreOptions = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    clearExpired: true,
    checkExpirationInterval: 900000, // 15분마다 만료된 세션 정리
    expiration: 86400000, // 24시간 (밀리초)
    createDatabaseTable: true, // 세션 테이블 자동 생성
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
};

const sessionStore = new MySQLStore(sessionStoreOptions);

// 세션 스토어 에러 핸들링
sessionStore.on('error', function (error) {
    console.error('세션 스토어 에러:', error);
});

// 세션 설정
app.use(session({
    key: 'texaspapa_session',
    secret: process.env.SESSION_SECRET || 'default-secret-key',
    store: sessionStore,
    resave: true, // 세션을 항상 저장 (서버리스 환경에서 중요)
    saveUninitialized: false,
    cookie: {
        path: '/', // 모든 경로에서 쿠키 사용
        secure: process.env.NODE_ENV === 'production', // HTTPS에서만 쿠키 전송
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24시간
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // CORS 대응
    },
    rolling: true // 요청마다 세션 만료 시간 갱신
}));

// 방문자 로그 수집 미들웨어
const visitorLog = require('./middleware/visitorLog');

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// 모든 페이지 뷰에 대한 방문자 로그 기록 (정적 파일 제외 로직은 미들웨어 내부에 포함)
app.use(visitorLog);

// 라우터 가져오기 및 등록
const mainRouter = require('./routes/main');
const communityRouter = require('./routes/community');
const storesRouter = require('./routes/stores');
const apiRouter = require('./routes/api');
const adminRouter = require('./routes/admin');

app.use('/', mainRouter);
app.use('/community', communityRouter);
app.use('/stores', storesRouter);
app.use('/api', apiRouter);
app.use('/console', adminRouter);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
