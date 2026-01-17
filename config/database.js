const mysql = require('mysql2/promise');

// 데이터베이스 연결 풀 생성
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // 최대 연결 수
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// 연결 테스트
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL 데이터베이스 연결 성공');
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL 데이터베이스 연결 실패:', err.message);
    });

module.exports = pool;
