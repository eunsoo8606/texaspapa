const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('📧 이메일 발송 테스트 시작...\n');

// 환경 변수 확인
console.log('📋 설정 확인:');
console.log('발신자 (EMAIL_USER):', process.env.EMAIL_USER);
console.log('비밀번호 설정 여부:', process.env.EMAIL_PASSWORD ? '✅ 설정됨' : '❌ 설정 안됨');
console.log('');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const mailOptions = {
    from: `"Texas Papa 테스트" <${process.env.EMAIL_USER}>`,
    to: 'eunsoo8606@gmail.com',
    subject: '[테스트] Texas Papa 이메일 발송 테스트',
    html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #ff6b35;">✅ 이메일 발송 테스트</h1>
                <p>이 메일이 정상적으로 도착했다면 이메일 설정이 올바르게 되어 있습니다!</p>
                <p><strong>발송 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
                <p><strong>발신자:</strong> ${process.env.EMAIL_USER}</p>
                <p><strong>수신자:</strong> eunsoo8606@gmail.com</p>
            </div>
        </div>
    `
};

console.log('📤 메일 발송 중...\n');

transporter.sendMail(mailOptions)
    .then((info) => {
        console.log('✅ 메일 발송 성공!');
        console.log('📬 Message ID:', info.messageId);
        console.log('📧 Response:', info.response);
        console.log('\n💡 Gmail에서 메일을 확인해보세요!');
        console.log('   - 받은편지함');
        console.log('   - 스팸함');
        console.log('   - 프로모션 탭');
    })
    .catch((error) => {
        console.error('❌ 메일 발송 실패!');
        console.error('에러 메시지:', error.message);
        console.error('\n🔧 해결 방법:');
        console.error('1. Gmail 앱 비밀번호가 올바른지 확인');
        console.error('2. 2단계 인증이 활성화되어 있는지 확인');
        console.error('3. .env 파일의 EMAIL_USER와 EMAIL_PASSWORD 확인');
    });
