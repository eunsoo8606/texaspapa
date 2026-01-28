-- ===========================
-- 세션 테이블 생성 (Vercel 서버리스 환경용)
-- ===========================
-- express-mysql-session이 자동으로 생성하지만,
-- 수동 생성이 필요한 경우를 대비한 스크립트

CREATE TABLE IF NOT EXISTS `sessions` (
    `session_id` VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    `expires` INT(11) UNSIGNED NOT NULL,
    `data` MEDIUMTEXT COLLATE utf8mb4_bin,
    PRIMARY KEY (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- 인덱스 추가 (만료된 세션 정리 성능 향상)
-- 이미 존재하는 경우 에러가 발생하지만 무시하셔도 됩니다
CREATE INDEX `expires_idx` ON `sessions` (`expires`);
