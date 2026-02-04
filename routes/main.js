const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../config/database');
const { generateSitemapXml, generateRssXml } = require('../utils/xmlGenerator');

// 메인 페이지 (프랜차이즈)
router.get('/', (req, res) => {
    res.render('franchise/index', {
        title: '텍사스파파 | 스마트한 창업의 시작',
        description: '원가율 20%, 소자본 창업 가능! 텍사스파파 크레페 프랜차이즈로 성공적인 디저트 창업을 시작하세요.',
        keywords: '텍사스파파프랜차이즈, 크레페가맹, 소자본창업, 디저트프랜차이즈',
        ogTitle: '텍사스파파 크레페 프랜차이즈 - 소자본 고수익 창업',
        ogDescription: '원가율 20%! 소자본으로 시작 가능한 텍사스파파 크레페 프랜차이즈',
        canonical: 'https://texaspapa.co.kr/',
        activePage: 'franchise'
    });
});

// 브랜드 소개
router.get('/brand', (req, res) => {
    res.render('brand/index', {
        title: '브랜드 스토리 - 텍사스파파 크레페',
        description: '텍사스파파 크레페의 브랜드 철학과 스토리를 만나보세요. 신뢰와 진심으로 만들어가는 프리미엄 크레페 브랜드.',
        keywords: '텍사스파파브랜드, 크레페브랜드, 브랜드스토리, 텍사스파파철학',
        ogTitle: '텍사스파파 브랜드 스토리 - 신뢰로 만들어가는 크레페',
        ogDescription: '점주님들의 신뢰로 성장하는 텍사스파파 크레페 브랜드 이야기',
        canonical: 'https://texaspapa.co.kr/brand',
        activePage: 'brand'
    });
});

// 회사 소개
router.get('/company', (req, res) => {
    res.render('brand/company', {
        title: '회사 소개 - 텍사스파파',
        description: '(주)동동F&B 텍사스파파 회사 소개. 크레페 프랜차이즈 전문 기업으로 성공적인 창업을 지원합니다.',
        keywords: '텍사스파파회사소개, 동동F&B, 크레페전문기업, 프랜차이즈본사',
        ogTitle: '텍사스파파 회사 소개 - (주)동동F&B',
        ogDescription: '크레페 프랜차이즈 전문 기업 텍사스파파를 소개합니다',
        canonical: 'https://texaspapa.co.kr/company',
        activePage: 'brand'
    });
});

// 메뉴 소개
router.get('/menu', (req, res) => {
    res.render('menu/index', {
        title: '메뉴 - 텍사스파파 크레페',
        description: '텍사스파파의 다양한 크레페 메뉴를 만나보세요. 프리미엄 재료로 만든 맛있는 크레페, 커피, 음료, 사이드 메뉴.',
        keywords: '텍사스파파메뉴, 크레페메뉴, 디저트메뉴, 크레페종류',
        ogTitle: '텍사스파파 크레페 메뉴 - 프리미엄 디저트',
        ogDescription: '다양한 크레페 메뉴와 커피, 음료를 만나보세요',
        canonical: 'https://texaspapa.co.kr/menu',
        activePage: 'menu'
    });
});

// 프랜차이즈 소개
router.get('/franchise', (req, res) => {
    res.render('franchise/index', {
        title: '프랜차이즈 - 텍사스파파 크레페',
        description: '원가율 20%, 소자본 창업 가능! 텍사스파파 크레페 프랜차이즈로 성공적인 디저트 창업을 시작하세요.',
        keywords: '텍사스파파프랜차이즈, 크레페가맹, 소자본창업, 디저트프랜차이즈',
        ogTitle: '텍사스파파 크레페 프랜차이즈 - 소자본 고수익 창업',
        ogDescription: '원가율 20%! 소자본으로 시작 가능한 텍사스파파 크레페 프랜차이즈',
        canonical: 'https://texaspapa.co.kr/franchise',
        activePage: 'franchise'
    });
});

// 오시는 길
router.get('/location', (req, res) => {
    res.render('brand/location', {
        title: '오시는 길 - 텍사스파파',
        description: '텍사스파파 본사 오시는 길 안내. 서울 송파구 방이동 위치, 대중교통 및 주차 안내.',
        keywords: '텍사스파파위치, 텍사스파파본사, 오시는길, 방이동크레페, 텍사스파파주소',
        ogTitle: '텍사스파파 오시는 길',
        ogDescription: '텍사스파파 본사 위치 및 연락처 안내입니다.',
        canonical: 'https://texaspapa.co.kr/location',
        activePage: 'brand'
    });
});

// SEO 파일 제공 (동적 생성)
router.get('/sitemap.xml', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const baseUrl = 'https://texaspapa.co.kr';

        const urls = [
            { loc: `${baseUrl}/`, lastmod: today, changefreq: 'daily', priority: '1.0' },
            { loc: `${baseUrl}/company`, lastmod: today, changefreq: 'monthly', priority: '0.8' },
            { loc: `${baseUrl}/stores`, lastmod: today, changefreq: 'weekly', priority: '0.9' },
            { loc: `${baseUrl}/location`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
            { loc: `${baseUrl}/menu`, lastmod: today, changefreq: 'weekly', priority: '0.9' },
            { loc: `${baseUrl}/franchise`, lastmod: today, changefreq: 'weekly', priority: '0.95' },
            { loc: `${baseUrl}/community/notice`, lastmod: today, changefreq: 'daily', priority: '0.8' },
            { loc: `${baseUrl}/community/event`, lastmod: today, changefreq: 'weekly', priority: '0.7' },
            { loc: `${baseUrl}/community/faq`, lastmod: today, changefreq: 'monthly', priority: '0.7' },
            { loc: `${baseUrl}/community/voice`, lastmod: today, changefreq: 'weekly', priority: '0.6' },
            { loc: `${baseUrl}/community/inquiry`, lastmod: today, changefreq: 'weekly', priority: '0.6' }
        ];

        const xml = generateSitemapXml(urls);
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('사이트맵 생성 오류:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/rss.xml', async (req, res) => {
    try {
        const baseUrl = 'https://texaspapa.co.kr';

        // 최신 공지사항 및 이벤트 10개 조회
        const [posts] = await db.query(
            `SELECT p.post_no, p.title, p.content, p.create_dt, b.category 
             FROM posts p 
             JOIN boards b ON p.board_id = b.id 
             WHERE b.company_id = 2 AND b.category IN ('notice', 'event')
             ORDER BY p.create_dt DESC 
             LIMIT 10`
        );

        const channel = {
            title: '텍사스파파 크레페 - Texas Papa Crepe',
            link: baseUrl,
            description: '텍사스파파 크레페 프랜차이즈 - 소자본 창업, 높은 수익률, 낮은 원가율로 성공적인 디저트 창업을 시작하세요',
            lastBuildDate: new Date().toUTCString(),
            items: posts.map(post => ({
                title: post.title,
                link: `${baseUrl}/community/${post.category}`, // 상세 페이지 구현 전이므로 목록으로 링크
                description: post.content.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...', // HTML 태그 제거 및 요약
                pubDate: new Date(post.create_dt).toUTCString(),
                guid: `${baseUrl}/community/${post.category}/${post.post_no}`
            }))
        };

        // 기본 항목 추가 (홈페이지 등)
        if (channel.items.length === 0) {
            channel.items.push({
                title: '텍사스파파 크레페 프랜차이즈 가맹점 모집',
                link: `${baseUrl}/franchise`,
                description: '원가율 20%! 소자본으로 시작 가능한 텍사스파파 크레페 프랜차이즈.',
                pubDate: new Date('2026-01-29').toUTCString(),
                guid: `${baseUrl}/franchise`
            });
        }

        const xml = generateRssXml(channel);
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('RSS 생성 오류:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
