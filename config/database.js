const mysql = require('mysql2/promise');

// 서버리스 환경(Vercel)에 최적화된 데이터베이스 연결 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.NODE_ENV === 'production' ? 2 : 10, // Vercel에서는 연결 수 제한
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    // 서버리스 환경을 위한 추가 설정
    connectTimeout: 10000, // 10초 연결 타임아웃
    acquireTimeout: 10000, // 10초 획득 타임아웃
    timeout: 60000, // 60초 쿼리 타임아웃
});

// 연결 테스트 (개발 환경에서만 실행)
// Vercel 서버리스 환경에서는 매 요청마다 실행되므로 제거
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    pool.getConnection()
        .then(connection => {
            console.log('✅ MySQL 데이터베이스 연결 성공');
            connection.release();
        })
        .catch(err => {
            console.error('❌ MySQL 데이터베이스 연결 실패:', err.message);
        });
}

module.exports = pool;
