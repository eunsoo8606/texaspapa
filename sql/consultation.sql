-- 창업 상담 신청 테이블
CREATE TABLE `consultation` (
    `consultation_id` INT NOT NULL AUTO_INCREMENT COMMENT '상담 신청 ID',
    `name` VARCHAR(50) NOT NULL COMMENT '신청자 이름' COLLATE 'utf8mb4_unicode_ci',
    `phone` VARCHAR(20) NOT NULL COMMENT '연락처' COLLATE 'utf8mb4_unicode_ci',
    `email` VARCHAR(100) NULL DEFAULT NULL COMMENT '이메일' COLLATE 'utf8mb4_unicode_ci',
    `region` VARCHAR(100) NULL DEFAULT NULL COMMENT '희망 지역' COLLATE 'utf8mb4_unicode_ci',
    `budget` VARCHAR(50) NULL DEFAULT NULL COMMENT '예산 규모' COLLATE 'utf8mb4_unicode_ci',
    `experience` VARCHAR(20) NULL DEFAULT NULL COMMENT '창업 경험 (있음/없음)' COLLATE 'utf8mb4_unicode_ci',
    `message` TEXT NULL DEFAULT NULL COMMENT '문의 내용' COLLATE 'utf8mb4_unicode_ci',
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '상태 (pending/processing/completed)' COLLATE 'utf8mb4_unicode_ci',
    `create_ip` VARCHAR(50) NULL DEFAULT NULL COMMENT '신청 IP' COLLATE 'utf8mb4_unicode_ci',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '신청일',
    `updated_at` TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
    PRIMARY KEY (`consultation_id`) USING BTREE,
    INDEX `idx_status` (`status`) USING BTREE,
    INDEX `idx_created_at` (`created_at`) USING BTREE
)
COMMENT='창업 상담 신청'
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;
