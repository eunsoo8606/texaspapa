const db = require('../config/database');

module.exports = async (req, res, next) => {
    // static 파일 및 API 요청은 제외 (필요시)
    if (req.path.startsWith('/images') || req.path.startsWith('/css') || req.path.startsWith('/js') || req.path.startsWith('/api')) {
        return next();
    }

    try {
        // 활성 팝업 조회
        const [popups] = await db.query(
            `SELECT * FROM popups 
             WHERE is_active = 1 
             AND (start_date IS NULL OR start_date <= CURDATE())
             AND (end_date IS NULL OR end_date >= CURDATE())`
        );

        // 전역 로컬 변수에 설정하여 모든 뷰에서 접근 가능하게 함
        res.locals.popups = popups || [];
        next();
    } catch (error) {
        console.error('Popup Middleware Error:', error);
        res.locals.popups = [];
        next();
    }
};
