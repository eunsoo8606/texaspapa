const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { encrypt, stripPhone } = require('../utils/crypto');
const { sendConsultationNotification } = require('../utils/email');

// 창업 상담 신청 API
router.post('/consultation', async (req, res) => {
    const { name, phone, email, region, budget, experience, path, message } = req.body;

    try {
        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: '이름과 연락처는 필수 입력 항목입니다.'
            });
        }

        const phoneRegex = /^[0-9-]+$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: '올바른 전화번호 형식이 아닙니다.'
            });
        }

        const createIp = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        const strippedPhone = stripPhone(phone);
        const encryptedName = encrypt(name);
        const encryptedEmail = encrypt(email);
        const encryptedPhone = encrypt(strippedPhone);

        await db.query(
            `INSERT INTO consultation (name, phone, email, region, budget, experience, path, message, create_ip, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [encryptedName, encryptedPhone, encryptedEmail, region, budget, experience, path, message, createIp]
        );

        try {
            await sendConsultationNotification({
                name,
                phone,
                email,
                region,
                budget,
                experience,
                path,
                message
            });
        } catch (emailError) {
            console.error('이메일 발송 실패:', emailError);
        }

        res.json({
            success: true,
            message: '상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.'
        });

    } catch (error) {
        console.error('상담 신청 오류:', error);
        res.status(500).json({
            success: false,
            message: '상담 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        });
    }
});

module.exports = router;
