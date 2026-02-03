CREATE TABLE `posts` (
	`post_no` INT NOT NULL AUTO_INCREMENT COMMENT '게시글 번호',
	`title` VARCHAR(50) NULL DEFAULT NULL COMMENT '제목' COLLATE 'euckr_korean_ci',
	`create_ip` VARCHAR(50) NULL DEFAULT NULL COMMENT '작성자 ip' COLLATE 'euckr_korean_ci',
	`update_ip` VARCHAR(50) NULL DEFAULT NULL COMMENT '수정자 ip' COLLATE 'euckr_korean_ci',
	`public_yn` VARCHAR(50) NULL DEFAULT NULL COMMENT '비밀글 유무' COLLATE 'euckr_korean_ci',
	`create_dt` VARCHAR(50) NULL DEFAULT NULL COMMENT '작성일' COLLATE 'euckr_korean_ci',
	`update_dt` VARCHAR(50) NULL DEFAULT NULL COMMENT '수정일' COLLATE 'euckr_korean_ci',
	`writer` VARCHAR(50) NULL DEFAULT NULL COMMENT '작성자' COLLATE 'euckr_korean_ci',
	`author_name` VARCHAR(50) NULL DEFAULT NULL COMMENT '작성자 이름 (비회원)' COLLATE 'euckr_korean_ci',
	`author_email` VARCHAR(100) NULL DEFAULT NULL COMMENT '작성자 이메일' COLLATE 'euckr_korean_ci',
	`author_phone` VARCHAR(20) NULL DEFAULT NULL COMMENT '작성자 연락처' COLLATE 'euckr_korean_ci',
	`password` VARCHAR(255) NULL DEFAULT NULL COMMENT '게시글 비밀번호 (bcrypt 해시)' COLLATE 'euckr_korean_ci',
	`status` VARCHAR(20) NULL DEFAULT 'pending' COMMENT '답변 상태 (pending/answered)' COLLATE 'euckr_korean_ci',
	`content` LONGTEXT NULL DEFAULT NULL COMMENT '내용' COLLATE 'euckr_korean_ci',
	`board_id` INT NULL DEFAULT NULL COMMENT '상위 게시판 아이디',
	`top_yn` CHAR(1) NULL DEFAULT 'N' COMMENT '상위노출유무' COLLATE 'euckr_korean_ci',
	`views` INT NULL DEFAULT NULL COMMENT '조회수',
	PRIMARY KEY (`post_no`) USING BTREE,
	INDEX `FK1_POST_BOARD_ID` (`board_id`) USING BTREE,
	CONSTRAINT `FK1_POST_BOARD_ID` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON UPDATE CASCADE ON DELETE CASCADE
)
COMMENT='게시글'
COLLATE='euckr_korean_ci'
ENGINE=InnoDB
AUTO_INCREMENT=7
;
