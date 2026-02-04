const db = require('../config/database');

/**
 * 방문자 로그 수집 미들웨어
 * - 정적 파일 요청 제외
 * - Referer, UTM 파라미터, IP, User-Agent 등 저장
 */
const visitorLog = async (req, res, next) => {
    try {
        // 1. 정적 파일 및 특정 경로 제외 (CSS, JS, 이미지, API 등)
        const skipExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.woff', '.woff2'];
        const isStaticFile = skipExtensions.some(ext => req.path.toLowerCase().endsWith(ext));
        const isApiRequest = req.path.startsWith('/api') || req.path.startsWith('/console/api');

        if (isStaticFile || isApiRequest) {
            return next();
        }

        // 2. 방문 정보 추출
        const ip = req.headers['x-forwarded-for'] || req.ip;
        const referrer = req.headers.referer || req.headers.referrer || null;
        const pageUrl = req.originalUrl;
        const userAgent = req.headers['user-agent'];
        const sessionId = req.sessionID; // express-session의 세션 ID 활용

        // 3. UTM 파라미터 추출
        const { utm_source, utm_medium, utm_campaign, utm_term, utm_content } = req.query;

        // 4. DB 저장 (비동기로 진행하되 응답을 차단하지 않음)
        // company_id는 기본값 2 (텍사스파파)
        const query = `
            INSERT INTO visitor_logs 
            (company_id, session_id, ip, referrer, page_url, user_agent, utm_source, utm_medium, utm_campaign, utm_term, utm_content) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            2, sessionId, ip, referrer, pageUrl, userAgent,
            utm_source || null,
            utm_medium || null,
            utm_campaign || null,
            utm_term || null,
            utm_content || null
        ];

        // 에러 발생 시 서버가 죽지 않도록 별도 처리
        db.query(query, params).catch(err => {
            console.error('⚠️ 방문자 로그 저장 실패:', err.message);
        });

        next();
    } catch (error) {
        console.error('⚠️ 방문자 로그 미들웨어 오류:', error);
        next(); // 오류가 발생해도 서비스는 계속되어야 함
    }
};

module.exports = visitorLog;
