const nodemailer = require('nodemailer');

// 이메일 전송 설정
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Gmail 주소
        pass: process.env.EMAIL_PASSWORD // Gmail 앱 비밀번호
    }
});

/**
 * 관리자에게 새 문의 알림 메일 발송
 * @param {Object} inquiry - 문의 정보
 * @param {string} inquiry.author_name - 작성자 이름
 * @param {string} inquiry.author_email - 작성자 이메일
 * @param {string} inquiry.author_phone - 작성자 연락처
 * @param {string} inquiry.title - 문의 제목
 * @param {string} inquiry.content - 문의 내용
 * @param {string} inquiry.boardType - 게시판 타입 (inquiry/voice)
 */
async function sendInquiryNotification(inquiry) {
    const boardTitle = inquiry.boardType === 'inquiry' ? '문의게시판' : '고객의소리';

    const mailOptions = {
        from: `"Texas Papa 알림" <${process.env.EMAIL_USER}>`,
        to: 'dongdongfnb@naver.com',
        subject: `[Texas Papa] 새로운 ${boardTitle} 등록`,
        html: `
            <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                <div style="background: linear-gradient(135deg, #0a33b5 0%, #0846d8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🔔 새로운 문의가 등록되었습니다</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">📋 게시판</h2>
                        <p style="margin: 0; color: #666; font-size: 16px;">${boardTitle}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">✍️ 제목</h2>
                        <p style="margin: 0; color: #666; font-size: 16px; font-weight: 600;">${inquiry.title}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">👤 작성자 정보</h2>
                        <p style="margin: 5px 0; color: #666;"><strong>이름:</strong> ${inquiry.author_name}</p>
                        <p style="margin: 5px 0; color: #666;"><strong>이메일:</strong> ${inquiry.author_email}</p>
                        <p style="margin: 5px 0; color: #666;"><strong>연락처:</strong> ${inquiry.author_phone}</p>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">📝 문의 내용</h2>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-wrap; color: #333; line-height: 1.6;">
${inquiry.content}
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://texaspapa.vercel.app/console" 
                           style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #0a33b5 0%, #0846d8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            관리자 페이지에서 답변하기
                        </a>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    <p>이 메일은 Texas Papa 웹사이트에서 자동으로 발송되었습니다.</p>
                    <p>&copy; 2026 Texas Papa. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ 관리자에게 문의 알림 메일 발송 완료:', inquiry.author_email);
        return true;
    } catch (error) {
        console.error('❌ 메일 발송 실패:', error);
        // 메일 발송 실패해도 문의 등록은 성공으로 처리
        return false;
    }
}

/**
 * 관리자에게 창업 상담 신청 알림 메일 발송
 * @param {Object} consultation - 상담 신청 정보
 */
async function sendConsultationNotification(consultation) {
    const mailOptions = {
        from: `"Texas Papa 알림" <${process.env.EMAIL_USER}>`,
        to: 'dongdongfnb@naver.com',
        subject: '[Texas Papa] 새로운 창업 상담 신청',
        html: `
            <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                <div style="background: linear-gradient(135deg, #0a33b5 0%, #0846d8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">🎯 새로운 창업 상담 신청</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">👤 신청자 정보</h2>
                        <p style="margin: 5px 0; color: #666;"><strong>이름:</strong> ${consultation.name}</p>
                        <p style="margin: 5px 0; color: #666;"><strong>연락처:</strong> ${consultation.phone}</p>
                        ${consultation.email ? `<p style="margin: 5px 0; color: #666;"><strong>이메일:</strong> ${consultation.email}</p>` : ''}
                    </div>
                    
                    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">📍 창업 희망 정보</h2>
                        ${consultation.region ? `<p style="margin: 5px 0; color: #666;"><strong>희망 지역:</strong> ${consultation.region}</p>` : ''}
                        ${consultation.budget ? `<p style="margin: 5px 0; color: #666;"><strong>예산 규모:</strong> ${consultation.budget}</p>` : ''}
                        ${consultation.experience ? `<p style="margin: 5px 0; color: #666;"><strong>창업 경험:</strong> ${consultation.experience}</p>` : ''}
                    </div>
                    
                    ${consultation.message ? `
                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">💬 문의 내용</h2>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; white-space: pre-wrap; color: #333; line-height: 1.6;">
${consultation.message}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="https://texaspapa.vercel.app/console" 
                           style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #0a33b5 0%, #0846d8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            관리자 페이지에서 확인하기
                        </a>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    <p>이 메일은 Texas Papa 웹사이트에서 자동으로 발송되었습니다.</p>
                    <p>&copy; 2026 Texas Papa. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ 관리자에게 창업 상담 신청 알림 메일 발송 완료:', consultation.name);
        return true;
    } catch (error) {
        console.error('❌ 메일 발송 실패:', error);
        return false;
    }
}

/**
 * 사용자에게 답변 완료 알림 메일 발송
 * @param {Object} data - 답변 정보
 */
async function sendReplyNotification(data) {
    const { userEmail, userName, postTitle, replyContent, boardType } = data;

    const boardTitle = boardType === 'inquiry' ? '문의게시판' : '고객의소리';

    const mailOptions = {
        from: `"Texas Papa" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `[Texas Papa] ${boardTitle} 답변이 등록되었습니다`,
        html: `
            <div style="font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                <div style="background: linear-gradient(135deg, #0a33b5 0%, #0846d8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">✅ 답변이 등록되었습니다</h1>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                        안녕하세요, <strong>${userName}</strong>님!
                    </p>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                        문의하신 내용에 대한 답변이 등록되었습니다.<br>
                        아래 내용을 확인해주세요.
                    </p>
                    
                    <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">📋 문의 제목</h2>
                        <p style="margin: 0; color: #666; font-weight: 600;">${postTitle}</p>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #333; margin: 0 0 10px 0; font-size: 16px;">💬 관리자 답변</h2>
                        <div style="background: #e8f2ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0a33b5; white-space: pre-wrap; color: #333; line-height: 1.8;">
${replyContent}
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #999; font-size: 14px; margin-bottom: 15px;">
                            추가 문의사항이 있으시면 언제든지 연락주세요.
                        </p>
                        <a href="https://texaspapa.vercel.app" 
                           style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #0a33b5 0%, #0846d8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Texas Papa 홈페이지 바로가기
                        </a>
                    </div>
                </div>
                
                <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
                    <p>이 메일은 Texas Papa 웹사이트에서 자동으로 발송되었습니다.</p>
                    <p>&copy; 2026 Texas Papa. All rights reserved.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ 사용자에게 답변 완료 알림 메일 발송 완료:', userEmail);
        return true;
    } catch (error) {
        console.error('❌ 메일 발송 실패:', error);
        return false;
    }
}

module.exports = {
    sendInquiryNotification,
    sendConsultationNotification,
    sendReplyNotification
};
