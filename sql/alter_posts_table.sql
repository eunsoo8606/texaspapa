-- posts 테이블에 작성자 정보 및 비밀번호 컬럼 추가
ALTER TABLE `posts`
ADD COLUMN `author_name` VARCHAR(50) NULL COMMENT '작성자 이름 (비회원)' AFTER `writer`,
ADD COLUMN `author_email` VARCHAR(100) NULL COMMENT '작성자 이메일' AFTER `author_name`,
ADD COLUMN `author_phone` VARCHAR(20) NULL COMMENT '작성자 연락처' AFTER `author_email`,
ADD COLUMN `password` VARCHAR(255) NULL COMMENT '게시글 비밀번호 (bcrypt 해시)' AFTER `author_phone`,
ADD COLUMN `status` VARCHAR(20) NULL DEFAULT 'pending' COMMENT '답변 상태 (pending/answered)' AFTER `password`;

-- 인덱스 추가
CREATE INDEX `idx_status` ON `posts` (`status`);
