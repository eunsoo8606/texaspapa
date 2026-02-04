-- 1. 기존 visitor_logs 테이블에 session_id 추가 (여정 추적용)
ALTER TABLE `visitor_logs` ADD COLUMN `session_id` VARCHAR(255) NULL DEFAULT NULL AFTER `company_id`;
ALTER TABLE `visitor_logs` ADD INDEX `idx_session_id` (`session_id`);

-- 2. 이벤트 로그 테이블 생성 (버튼 클릭 등 액션 추적)
CREATE TABLE `event_logs` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`company_id` INT NULL DEFAULT '2',
	`session_id` VARCHAR(255) NULL DEFAULT NULL,
	`event_name` VARCHAR(50) NOT NULL COMMENT '이벤트명 (예: CLICK_CONSULT)',
	`page_url` VARCHAR(255) NULL DEFAULT NULL,
	`target_info` TEXT NULL DEFAULT NULL COMMENT '클릭한 대상 정보',
	`created_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP),
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_session_event` (`session_id`, `event_name`),
	INDEX `idx_created_at` (`created_at`)
) COMMENT='사용자 주요 활동 로그';
