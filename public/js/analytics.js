/**
 * Texas Papa Analytics JS
 * - 버튼 클릭 추적
 * - 페이지 체류 보조 로직
 */
(function () {
    // 페이지 진입 기록
    sendEvent('PAGE_ENTER', { path: window.location.pathname });

    // 2. 주기적 활동 신호 (Heartbeat) - 체류 시간 측정용
    // 30초마다 서버에 생존 신호를 보내 실제 체류 시간을 정교하게 측정
    setInterval(function () {
        sendEvent('HEARTBEAT', { path: window.location.pathname });
    }, 30000);

    // 3. 문의하기 버튼 클릭 추적 (ID 기반 또는 클래스 기반)
    document.addEventListener('click', function (e) {
        // '문의하기' 버튼 또는 관련 요소 클릭 확인
        const target = e.target.closest('button, a');
        if (!target) return;

        const text = target.innerText.trim();
        // 다양한 버튼 텍스트 대응
        if (text.includes('문의하기') || text.includes('상담 신청') || text.includes('가맹 문의') || text.includes('상담하기')) {
            sendEvent('CLICK_CONSULT', {
                buttonText: text,
                targetHref: target.href || null,
                elementId: target.id || null,
                pagePath: window.location.pathname
            });
        }
    });

    /**
     * 서버로 이벤트 전송
     */
    function sendEvent(eventName, targetInfo) {
        const data = JSON.stringify({ eventName, targetInfo });

        if (navigator.sendBeacon) {
            const blob = new Blob([data], { type: 'application/json' });
            navigator.sendBeacon('/api/log/event', blob);
        } else {
            fetch('/api/log/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: data
            }).catch(err => console.error('Log failure:', err));
        }
    }

    console.log('📊 Analytics active');
})();
