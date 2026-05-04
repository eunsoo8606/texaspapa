const crypto = require('crypto');

const ENCRYPTION_KEY = Buffer.from('683c5097fa3038e421260a737b077323386ebc2648952270dc62fda5fa900f8c', 'hex');
const ALGORITHM = 'aes-256-cbc';

function decrypt(text) {
    if (!text || !text.includes(':')) return text;
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return 'DECRYPTION_FAILED: ' + error.message;
    }
}

const target = '1dddfe2490bf260f743a6f0648a03254:22498a6c12b0b1847';
console.log('Decrypting:', target);
console.log('Result:', decrypt(target));

// Try without the last char if it was a typo
const target2 = '1dddfe2490bf260f743a6f0648a03254:22498a6c12b0b184';
console.log('Decrypting target2:', target2);
console.log('Result2:', decrypt(target2));

// Try with 32 chars of ciphertext (padding issue?)
const target3 = '1dddfe2490bf260f743a6f0648a03254:22498a6c12b0b1847000000000000000';
console.log('Decrypting target3:', target3);
console.log('Result3:', decrypt(target3));
