CREATE TABLE `visitor_logs` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`company_id` INT NULL DEFAULT '2' COMMENT '회사 ID (텍사스파파: 2)',
	`ip` VARCHAR(45) NULL DEFAULT NULL COMMENT '방문자 IP',
	`referrer` TEXT NULL DEFAULT NULL COMMENT '이전 페이지 URL',
	`page_url` VARCHAR(255) NOT NULL COMMENT '현재 방문한 페이지',
	`user_agent` TEXT NULL DEFAULT NULL COMMENT '브라우저 정보',
	`utm_source` VARCHAR(50) NULL DEFAULT NULL,
	`utm_medium` VARCHAR(50) NULL DEFAULT NULL,
	`utm_campaign` VARCHAR(50) NULL DEFAULT NULL,
	`utm_term` VARCHAR(50) NULL DEFAULT NULL,
	`utm_content` VARCHAR(50) NULL DEFAULT NULL,
	`created_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_created_at` (`created_at`) USING BTREE,
	INDEX `idx_company_id` (`company_id`) USING BTREE
) COMMENT='방문자 통계 로그';
