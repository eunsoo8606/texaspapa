const crypto = require('crypto');

// AES-256-CBC 설정을 위한 키와 알고리즘
// ENCRYPTION_KEY는 32바이트(64자 16진수)여야 합니다.
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 16; // AES 블록 크기

/**
 * 텍스트를 암호화합니다.
 * @param {string} text - 암호화할 텍스트
 * @returns {string} - 암호화된 데이터 (IV:EncryptedText 형식)
 */
function encrypt(text) {
    if (!text) return text;
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.finalize('hex');
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return text;
    }
}

/**
 * 암호화된 텍스트를 복호화합니다.
 * @param {string} text - 복호화할 텍스트 (IV:EncryptedText 형식)
 * @returns {string} - 복호화된 원본 텍스트
 */
function decrypt(text) {
    if (!text || !text.includes(':')) return text;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.finalize('utf8');
        return decrypted;
    } catch (error) {
        // 복호화 실패 시 (암호화되지 않은 기존 데이터 등) 원본 반환
        return text;
    }
}

/**
 * 전화번호에 하이픈을 추가합니다.
 * @param {string} phone - 하이픈이 없는 전화번호 (예: 01012345678)
 * @returns {string} - 포맷팅된 전화번호 (예: 010-1234-5678)
 */
function formatPhone(phone) {
    if (!phone) return phone;
    // 숫자만 남기기
    const cleaned = ('' + phone).replace(/\D/g, '');

    // 10자리인 경우 (예: 02-123-4567)
    if (cleaned.length === 10) {
        if (cleaned.startsWith('02')) {
            return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
        }
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    // 11자리인 경우 (예: 010-1234-5678)
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    // 9자리인 경우 (예: 02-123-4567)
    if (cleaned.length === 9) {
        return cleaned.replace(/(\d{2})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    return phone;
}

/**
 * 전화번호에서 하이픈을 제거합니다.
 * @param {string} phone - 전화번호
 * @returns {string} - 하이픈이 제거된 숫자만 있는 전화번호
 */
function stripPhone(phone) {
    if (!phone) return phone;
    return phone.replace(/[^0-9]/g, '');
}

module.exports = {
    encrypt,
    decrypt,
    formatPhone,
    stripPhone
};
