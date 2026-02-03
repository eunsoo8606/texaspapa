const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 가맹점 현황 (Store Locator)
router.get('/', async (req, res) => {
    try {
        // 사용 여부(use_yn)가 'Y'인 매장만 조회
        const [stores] = await db.query(
            'SELECT name, address, phone, lat, lng FROM stores WHERE use_yn = ? ORDER BY id DESC',
            ['Y']
        );

        res.render('stores/index', {
            title: '가맹점 찾기 - 텍사스파파',
            description: '텍사스파파 전국 가맹점 위치 및 정보를 확인하세요.',
            keywords: '텍사스파파매장, 가맹점찾기, 텍사스파파위치',
            ogTitle: '텍사스파파 가맹점 찾기',
            ogDescription: '전국 텍사스파파 매장 위치 안내',
            canonical: 'https://texaspapa.co.kr/stores',
            activePage: 'brand',
            stores
        });
    } catch (error) {
        console.error('가맹점 정보 조회 오류:', error);
        res.render('stores/index', {
            title: '가맹점 찾기 - 텍사스파파',
            description: '텍사스파파 전국 가맹점 위치 및 정보를 확인하세요.',
            keywords: '텍사스파파매장, 가맹점찾기, 텍사스파파위치',
            ogTitle: '가맹점 찾기',
            ogDescription: '매장 정보를 불러오는 중 오류가 발생했습니다.',
            canonical: 'https://texaspapa.co.kr/stores',
            activePage: 'brand',
            stores: []
        });
    }
});

module.exports = router;
