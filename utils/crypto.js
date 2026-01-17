const crypto = require('crypto');

// 환경 변수에서 암호화 키 로드
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';

// 암호화 키 검증
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
}

// Hex 문자열을 Buffer로 변환
const KEY = Buffer.from(ENCRYPTION_KEY, 'hex');

/**
 * AES-256-CBC 암호화
 * @param {string} text - 암호화할 텍스트
 * @returns {string} - 암호화된 텍스트 (iv:encrypted 형식)
 */
function encrypt(text) {
    if (!text) return null;

    try {
        // 랜덤 IV 생성 (16 bytes)
        const iv = crypto.randomBytes(16);

        // 암호화 객체 생성
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

        // 암호화 수행
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // IV와 암호화된 데이터를 함께 반환 (콜론으로 구분)
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('암호화 오류:', error);
        throw new Error('데이터 암호화 실패');
    }
}

/**
 * AES-256-CBC 복호화
 * @param {string} encryptedText - 암호화된 텍스트 (iv:encrypted 형식)
 * @returns {string} - 복호화된 원본 텍스트
 */
function decrypt(encryptedText) {
    if (!encryptedText) return null;

    try {
        // IV와 암호화된 데이터 분리
        const parts = encryptedText.split(':');
        if (parts.length !== 2) {
            throw new Error('잘못된 암호화 형식');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];

        // 복호화 객체 생성
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

        // 복호화 수행
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('복호화 오류:', error);
        throw new Error('데이터 복호화 실패');
    }
}

module.exports = {
    encrypt,
    decrypt
};
