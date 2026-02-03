CREATE TABLE `boards` (
	`id` INT NOT NULL AUTO_INCREMENT COMMENT '게시글 ID',
	`category` VARCHAR(50) NULL DEFAULT 'general' COMMENT '카테고리 (general, notice, faq 등)' COLLATE 'utf8mb4_unicode_ci',
	`type` VARCHAR(50) NULL DEFAULT NULL COMMENT '게시판타입(photo,list)' COLLATE 'utf8mb4_unicode_ci',
	`created_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP) COMMENT '작성일',
	`updated_at` TIMESTAMP NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
	`company_id` INT NULL DEFAULT NULL COMMENT '회사 아이디',
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `idx_category` (`category`) USING BTREE,
	INDEX `idx_created_at` (`created_at`) USING BTREE,
	INDEX `FK1_COMPANY_ID` (`company_id`) USING BTREE,
	CONSTRAINT `FK1_COMPANY_ID` FOREIGN KEY (`company_id`) REFERENCES `company` (`company_id`) ON UPDATE NO ACTION ON DELETE CASCADE
)
COMMENT='게시판 테이블'
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB
AUTO_INCREMENT=10
;
