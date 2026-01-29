require('dotenv').config(); // 환경 변수 로드

const express = require('express');
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

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'public')));

// 라우팅
app.get('/', (req, res) => {
    res.render('franchise', {
        title: '텍사스파파 크레페 프랜차이즈 - 소자본 고수익 창업',
        description: '원가율 20%, 소자본 창업 가능! 텍사스파파 크레페 프랜차이즈로 성공적인 디저트 창업을 시작하세요. 1인 운영 가능, 낮은 로스율, 높은 순이익.',
        keywords: '텍사스파파, 크레페프랜차이즈, 소자본창업, 디저트창업, 크레페가맹점, 1인창업, 고수익창업, 원가율20%',
        ogTitle: '텍사스파파 크레페 프랜차이즈 - 소자본으로 시작하는 고수익 창업',
        ogDescription: '원가율 20%! 소자본으로 시작 가능한 텍사스파파 크레페 프랜차이즈. 지금 바로 창업 상담 받으세요.',
        canonical: 'https://texaspapa.co.kr',
        activePage: 'franchise'
    });
});

app.get('/brand', (req, res) => {
    res.render('brand', {
        title: '브랜드 스토리 - 텍사스파파 크레페',
        description: '텍사스파파 크레페의 브랜드 철학과 스토리를 만나보세요. 신뢰와 진심으로 만들어가는 프리미엄 크레페 브랜드.',
        keywords: '텍사스파파브랜드, 크레페브랜드, 브랜드스토리, 텍사스파파철학',
        ogTitle: '텍사스파파 브랜드 스토리 - 신뢰로 만들어가는 크레페',
        ogDescription: '점주님들의 신뢰로 성장하는 텍사스파파 크레페 브랜드 이야기',
        canonical: 'https://texaspapa.co.kr/brand',
        activePage: 'brand'
    });
});

app.get('/company', (req, res) => {
    res.render('company', {
        title: '회사 소개 - 텍사스파파',
        description: '(주)동동F&B 텍사스파파 회사 소개. 크레페 프랜차이즈 전문 기업으로 성공적인 창업을 지원합니다.',
        keywords: '텍사스파파회사소개, 동동F&B, 크레페전문기업, 프랜차이즈본사',
        ogTitle: '텍사스파파 회사 소개 - (주)동동F&B',
        ogDescription: '크레페 프랜차이즈 전문 기업 텍사스파파를 소개합니다',
        canonical: 'https://texaspapa.co.kr/company',
        activePage: 'brand'
    });
});

app.get('/menu', (req, res) => {
    res.render('menu', {
        title: '메뉴 - 텍사스파파 크레페',
        description: '텍사스파파의 다양한 크레페 메뉴를 만나보세요. 프리미엄 재료로 만든 맛있는 크레페, 커피, 음료, 사이드 메뉴.',
        keywords: '텍사스파파메뉴, 크레페메뉴, 디저트메뉴, 크레페종류',
        ogTitle: '텍사스파파 크레페 메뉴 - 프리미엄 디저트',
        ogDescription: '다양한 크레페 메뉴와 커피, 음료를 만나보세요',
        canonical: 'https://texaspapa.co.kr/menu',
        activePage: 'menu'
    });
});

app.get('/franchise', (req, res) => {
    res.render('franchise', {
        title: '프랜차이즈 - 텍사스파파 크레페',
        description: '원가율 20%, 소자본 창업 가능! 텍사스파파 크레페 프랜차이즈로 성공적인 디저트 창업을 시작하세요.',
        keywords: '텍사스파파프랜차이즈, 크레페가맹, 소자본창업, 디저트프랜차이즈',
        ogTitle: '텍사스파파 크레페 프랜차이즈 - 소자본 고수익 창업',
        ogDescription: '원가율 20%! 소자본으로 시작 가능한 텍사스파파 크레페 프랜차이즈',
        canonical: 'https://texaspapa.co.kr/franchise',
        activePage: 'franchise'
    });
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
            },
            query: req.query // 쿼리 파라미터 전달
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

// ===========================
// 문의 작성 페이지 (문의게시판, 고객의소리만)
// ===========================
app.get('/community/:tab/write', (req, res) => {
    const { tab } = req.params;

    // 문의게시판과 고객의소리만 사용자 작성 가능
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

// ===========================
// 문의 작성 처리
// ===========================
app.post('/community/:tab/write', async (req, res) => {
    const { tab } = req.params;
    const { author_name, author_email, author_phone, password, title, content } = req.body;

    try {
        // 문의게시판과 고객의소리만 허용
        if (tab !== 'inquiry' && tab !== 'voice') {
            return res.status(400).send('잘못된 요청입니다.');
        }

        // 입력 검증
        if (!author_name || !author_email || !author_phone || !password || !title || !content) {
            return res.status(400).send('모든 필수 항목을 입력해주세요.');
        }

        const db = require('./config/database');
        const bcrypt = require('bcrypt');

        // boards 테이블에서 해당 게시판 ID 조회 (company_id 2번 - Texas Papa)
        const [boardResult] = await db.query(
            'SELECT id FROM boards WHERE company_id = 2 AND category = ? LIMIT 1',
            [tab]
        );

        if (boardResult.length === 0) {
            return res.status(400).send('게시판을 찾을 수 없습니다.');
        }

        const boardId = boardResult[0].id;

        // 비밀번호 해시
        const passwordHash = await bcrypt.hash(password, 10);

        // IP 주소
        const createIp = req.ip || req.connection.remoteAddress;

        // posts 테이블에 저장
        await db.query(
            `INSERT INTO posts 
            (board_id, title, content, writer, author_name, author_email, author_phone, password, status, create_ip, create_dt, views, top_yn) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, NOW(), 0, 'N')`,
            [boardId, title, content, author_name, author_name, author_email, author_phone, passwordHash, createIp]
        );

        // 관리자에게 이메일 알림 발송 (비동기, 실패해도 문의 등록은 성공)
        try {
            const { sendInquiryNotification } = require('./utils/email');
            await sendInquiryNotification({
                author_name,
                author_email,
                author_phone,
                title,
                content,
                boardType: tab
            });
        } catch (emailError) {
            console.error('이메일 발송 실패 (문의는 정상 등록됨):', emailError);
        }

        res.redirect(`/community/${tab}?success=1`);

    } catch (error) {
        console.error('문의 작성 오류:', error);
        res.status(500).send('문의 작성 중 오류가 발생했습니다.');
    }
});

// ===========================
// 비밀번호 확인 페이지
// ===========================
app.get('/community/:tab/:id', async (req, res) => {
    const { tab, id } = req.params;

    try {
        // 문의게시판과 고객의소리는 비밀번호 확인 필요
        if (tab === 'inquiry' || tab === 'voice') {
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
                error: null
            });
        }

        // 다른 게시판은 바로 조회 (추후 구현)
        res.redirect(`/community/${tab}`);

    } catch (error) {
        console.error('게시글 조회 오류:', error);
        res.status(500).send('게시글 조회 중 오류가 발생했습니다.');
    }
});

// ===========================
// 비밀번호 검증 및 상세 조회
// ===========================
app.post('/community/:tab/:id/verify', async (req, res) => {
    const { tab, id } = req.params;
    const { password } = req.body;

    try {
        const db = require('./config/database');
        const bcrypt = require('bcrypt');

        // 게시글 조회
        const [posts] = await db.query(
            'SELECT * FROM posts WHERE post_no = ?',
            [id]
        );

        if (posts.length === 0) {
            return res.status(404).send('게시글을 찾을 수 없습니다.');
        }

        const post = posts[0];

        // 비밀번호 검증
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

        // 답변 조회
        const [replies] = await db.query(
            'SELECT * FROM replies WHERE post_no = ? ORDER BY created_at DESC LIMIT 1',
            [id]
        );

        const reply = replies.length > 0 ? replies[0] : null;

        // 상세 페이지 렌더링
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

// 창업 상담 신청 API
app.post('/api/consultation', async (req, res) => {
    const { name, phone, email, region, budget, experience, message } = req.body;

    try {
        // 입력 검증
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: '이름과 연락처는 필수 입력 항목입니다.'
            });
        }

        // 전화번호 형식 검증 (간단한 검증)
        const phoneRegex = /^[0-9-]+$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: '올바른 전화번호 형식이 아닙니다.'
            });
        }

        const db = require('./config/database');
        const createIp = req.ip || req.connection.remoteAddress;

        // 상담 신청 저장
        await db.query(
            `INSERT INTO consultation (name, phone, email, region, budget, experience, message, create_ip, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [name, phone, email, region, budget, experience, message, createIp]
        );

        // 관리자에게 이메일 알림 발송
        try {
            const { sendConsultationNotification } = require('./utils/email');
            await sendConsultationNotification({
                name,
                phone,
                email,
                region,
                budget,
                experience,
                message
            });
        } catch (emailError) {
            console.error('이메일 발송 실패 (상담 신청은 정상 등록됨):', emailError);
        }

        res.json({
            success: true,
            message: '상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.'
        });

    } catch (error) {
        console.error('상담 신청 오류:', error);
        res.status(500).json({
            success: false,
            message: '상담 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
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
