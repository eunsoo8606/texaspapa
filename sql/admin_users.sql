-- ===========================
-- 관리자 계정 테이블 생성
-- ===========================

-- 기존 테이블이 있으면 삭제 (개발 환경에서만 사용)
-- DROP TABLE IF EXISTS admin_users;

CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '로그인 아이디',
    password_hash VARCHAR(255) NOT NULL COMMENT 'bcrypt 해시된 비밀번호',
    name_encrypted VARCHAR(255) NOT NULL COMMENT 'AES-256 암호화된 이름',
    email_encrypted VARCHAR(255) COMMENT 'AES-256 암호화된 이메일',
    phone_encrypted VARCHAR(255) COMMENT 'AES-256 암호화된 전화번호',
    role ENUM('super_admin', 'admin', 'manager') DEFAULT 'admin' COMMENT '권한 레벨',
    is_active BOOLEAN DEFAULT TRUE COMMENT '계정 활성화 상태',
    last_login_at DATETIME COMMENT '마지막 로그인 시간',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시',
    INDEX idx_username (username),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='관리자 계정 테이블';

-- ===========================
-- 기본 관리자 계정 생성
-- ===========================
-- 주의: 이 스크립트는 암호화 함수를 사용하지 않으므로,
-- 실제 데이터는 애플리케이션에서 INSERT 해야 합니다.
-- 
-- 기본 계정 정보:
-- - 아이디: admin
-- - 비밀번호: admin123
-- - 이름: 관리자
-- - 이메일: admin@texaspapa.co.kr
-- 
-- 이 계정은 애플리케이션 최초 실행 시 자동으로 생성됩니다.

-- ===========================
-- 세션 테이블 생성 (선택사항)
-- ===========================
-- express-session을 MySQL에 저장하려면 사용
-- 현재는 메모리 세션을 사용하므로 선택사항

CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) NOT NULL PRIMARY KEY,
    expires INT UNSIGNED NOT NULL,
    data MEDIUMTEXT,
    INDEX idx_expires (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='세션 저장 테이블';
