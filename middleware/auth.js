/**
 * 인증 미들웨어
 * 로그인 여부를 확인하고, 미인증 시 로그인 페이지로 리다이렉트
 */
function requireAuth(req, res, next) {
    // 세션에 관리자 정보가 있는지 확인
    if (req.session && req.session.adminUser) {
        // 인증된 사용자
        console.log('✅ 인증 성공:', req.session.adminUser.adminId);
        return next();
    }

    // 미인증 사용자 - 로그인 페이지로 리다이렉트
    console.log('❌ 인증 실패 - 세션 없음. 세션 ID:', req.sessionID);
    console.log('📦 현재 세션 데이터:', req.session);
    return res.redirect('/console?error=session_expired');
}

/**
 * 로그인 페이지 접근 미들웨어
 * 이미 로그인된 경우 대시보드로 리다이렉트
 */
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.adminUser) {
        // 이미 로그인된 경우 대시보드로
        return res.redirect('/console/dashboard');
    }

    // 미인증 사용자는 계속 진행
    next();
}

module.exports = {
    requireAuth,
    redirectIfAuthenticated
};
