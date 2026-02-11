CREATE TABLE IF NOT EXISTS `popups` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '고유 ID',
  `company_id` int(11) NOT NULL DEFAULT '2' COMMENT '회사/브랜드 ID',
  `title` varchar(255) NOT NULL COMMENT '팝업 제목 (관리자용)',
  `content` text COMMENT '팝업 내용 (HTML 또는 텍스트)',
  `image_url` varchar(255) DEFAULT NULL COMMENT '팝업 이미지 경로',
  `link_url` varchar(255) DEFAULT NULL COMMENT '클릭 시 이동할 URL',
  `target` varchar(20) DEFAULT '_blank' COMMENT '링크 타겟 (_blank, _self 등)',
  `width` int(11) DEFAULT '400' COMMENT '팝업 가로 크기',
  `height` int(11) DEFAULT '500' COMMENT '팝업 세로 크기',
  `pos_top` int(11) DEFAULT '100' COMMENT '팝업 상단 위치 (px)',
  `pos_left` int(11) DEFAULT '100' COMMENT '팝업 좌측 위치 (px)',
  `start_date` date DEFAULT NULL COMMENT '노출 시작일',
  `end_date` date DEFAULT NULL COMMENT '노출 종료일',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '활성 여부 (1: 활성, 0: 비활성)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성일',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='메인 페이지 팝업 관리 테이블';
