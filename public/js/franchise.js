// Franchise Page JavaScript Interactions

// 창업 절차 아코디언 기능 (인라인 onclick 대응을 위해 최상단에 전역 즉시 등록)
window.togglePhase = (el) => {
    const isActive = el.classList.contains('active');
    document.querySelectorAll('.phase-card').forEach(card => {
        card.classList.remove('active');
    });
    if (!isActive) {
        el.classList.add('active');
    }
};

// 기존 넥서스 대시보드 애니메이션
const startNexusAnimation = () => {
    const counters = document.querySelectorAll('.counter');
    const nodes = document.querySelectorAll('.nexus-node');

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        const increment = target / 50;
        const updateCount = () => {
            if (count < target) {
                count += increment;
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 40);
            } else { counter.innerText = target; }
        };
        updateCount();
    });

    nodes.forEach((node, index) => {
        setTimeout(() => { node.classList.add('visible'); }, 500 + (index * 600));
    });
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            startNexusAnimation();
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

document.querySelectorAll('.franchise-competence').forEach(el => observer.observe(el));

// 섹션 2: GSAP 스크롤 인터랙션
gsap.registerPlugin(ScrollTrigger);

// 1. 전역 fade-up 애니메이션 로직
gsap.utils.toArray('.fade-up').forEach((el) => {
    let delay = 0;
    if (el.classList.contains('delay-1')) delay = 0.2;
    if (el.classList.contains('delay-2')) delay = 0.4;
    if (el.classList.contains('delay-3')) delay = 0.6;

    // 초기 상태를 CSS에서 투명도 1로 설정했으므로, gsap.from을 사용하여 0에서 1로 애니메이션
    gsap.from(el, {
        scrollTrigger: {
            trigger: el,
            start: "top 95%",
            toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 30,
        duration: 1,
        delay: delay,
        ease: "power2.out"
    });
});

// 카운트업 애니메이션 실행 헬퍼
function runCountUp(element) {
    if (element.classList.contains('counted')) return;
    element.classList.add('counted');
    
    const targetVal = parseFloat(element.getAttribute('data-value'));
    const suffix = element.getAttribute('data-suffix') || '';
    const isComma = element.getAttribute('data-format') === 'comma';
    
    const obj = { val: 0 };
    gsap.to(obj, {
        val: targetVal,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: function() {
            let currentVal = Math.floor(obj.val);
            if (isComma) {
                element.innerText = currentVal.toLocaleString() + suffix;
            } else {
                element.innerText = currentVal + suffix;
            }
        }
    });
}

// 3. 수익의 진화 (Profit Evolution) 인터랙션 (전체 디바이스 스크롤 핀 적용)
const evoTimeline = gsap.timeline({
    scrollTrigger: {
        trigger: ".profit-evolution-section",
        start: "top top",
        end: "+=270%",
        scrub: 1.2,
        pin: true,
        anticipatePin: 1
    }
});

// 각 레이어 활성화 시점에 숫자 카운트업 실행 콜백 연결
evoTimeline
    .call(() => {
        document.querySelectorAll('.layer-step-1 .count-up').forEach(el => runCountUp(el));
    }, null, 0)
    .to(".layer-step-2", { clipPath: "inset(0 0 0 0)", ease: "power1.inOut" })
    .to("#evoDivider", { left: "0%", ease: "power1.inOut" }, 0)
    .to(".layer-step-1", { x: -60, opacity: 0.5, ease: "power1.inOut" }, 0)
    .call(() => {
        document.querySelectorAll('.layer-step-2 .count-up').forEach(el => runCountUp(el));
    }, null, 0.4)
    .from(".layer-step-2 .eco-content-box", { y: 30, opacity: 0, duration: 0.3 }, 0.2)
    .set("#evoDivider", { left: "100%" })
    .to(".layer-step-3", { clipPath: "inset(0 0 0 0)", ease: "power1.inOut" }, "+=0.1")
    .to("#evoDivider", { left: "0%", ease: "power1.inOut" }, "<")
    .to(".layer-step-2", { x: -60, opacity: 0.5, ease: "power1.inOut" }, "<")
    .call(() => {
        document.querySelectorAll('.layer-step-3 .count-up').forEach(el => runCountUp(el));
    }, null, ">-0.1")
    .from(".layer-step-3 .eco-content-box", { y: 30, opacity: 0, duration: 0.3 }, "<0.2")
    .to("#winnerStampEvo", {
        scale: 1,
        opacity: 1,
        rotation: -15,
        duration: 0.5,
        ease: "bounce.out"
    }, "<0.3");

// 4. 체크포인트 리빌 애니메이션
gsap.utils.toArray('.checkpoint-item').forEach((item) => {
    const image = item.querySelector('.cp-image');
    const content = item.querySelector('.cp-content');
    const isReverse = item.classList.contains('reverse');

    const itemTl = gsap.timeline({
        scrollTrigger: {
            trigger: item,
            start: "top 95%",
            toggleActions: "play none none reverse",
            onEnter: () => image.classList.add('revealed'),
            onLeaveBack: () => image.classList.remove('revealed')
        }
    });

    itemTl.from(content, {
        x: isReverse ? -60 : 60,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
    });

    gsap.to(image, {
        scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: 1 },
        y: -30, ease: "none"
    });
});

// 5. 인터랙티브 스크롤 시퀀스 (MainShrinkBox) - 데스크톱만
ScrollTrigger.matchMedia({
    "(min-width: 769px)": function () {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".scroll-sequence-section",
                start: "top top",
                end: "bottom top",
                scrub: 1,
                pin: true,
                anticipatePin: 1
            }
        });
        tl.to("#mainShrinkBox", { width: "500px", height: "700px", borderRadius: "20px", duration: 2, ease: "power2.inOut" })
            .from(".grid-card", { opacity: 0, scale: 0.8, stagger: 0.2, duration: 1 }, "-=1");
    }
});

// 6. 창업비용 패키지 데이터 및 전환 로직
const packageData = {
    trans: {
        total: "1,380",
        info: "단위 : 만 원",
        exclusion: "*별도사항 : 철거, 전기증설, 소방, 냉난방기, 외부 필름 시공, 어닝, 가구, 설비 공사, 지방 경비, 포스기, 키오스크 등(매장 상황에 따라 다를 수 있음)",
        items: [
            { cat: "가맹비", desc: "브랜드 사용권 / 영업지역 보장", price: "300", note: "<span class='promo-badge'>50호점 한정</span>" },
            { cat: "교육비", desc: "레시피 전수 / 매장 운영 교육 / 오픈바이징", price: "500", note: "<span class='promo-badge'>50호점 한정</span>" },
            { cat: "물류/계약이행보증금", desc: "오픈 및 영업 이행 담보 보증(계약 종료 시 환급)", price: "면제" },
            { cat: "인테리어(기본) & 기기설비 및 집기", desc: "간판(*기존간판 천갈이 기준), 부분 도장 / 크레페 기계, 반죽기, 커피머신 등", price: "330", note: "*일부 중고제품 기준 / 미보유 제품만 구매 가능" },
            { cat: "초도물품", desc: "식자재, 부자재", price: "250" },
            { cat: "로열티", desc: "정률제", price: "2%/월매출" }
        ]
    },
    basic: {
        total: "2,580",
        info: "단위 : 만 원(7평 기준)",
        exclusion: "*별도사항 : 철거, 전기증설, 소방, 냉난방기, 외부 필름 시공, 어닝, 가구, 설비 공사, 지방 경비, 목공, 포스기, 키오스크 등(매장 상황에 따라 다를 수 있음)",
        items: [
            { cat: "가맹비", desc: "브랜드 사용권 / 영업지역 보장", price: "500", note: "<span class='promo-badge'>50호점 한정</span>" },
            { cat: "교육비", desc: "레시피 전수 / 매장 운영 교육 / 오픈바이징", price: "500", note: "<span class='promo-badge'>50호점 한정</span>" },
            { cat: "물류/계약이행보증금", desc: "오픈 및 영업 이행 담보 보증(계약 종료 시 환급)", price: "면제" },
            { cat: "인테리어(기본) & 기기설비 및 집기", desc: "간판(*기존간판 천갈이 기준), 부분 도장, 바닥 / 크레페 기계, 반죽기, 커피머신, 제빙기, 냉장고, 냉동고 등", price: "1,280", note: "*일부 중고제품 기준 / 미보유 제품만 구매 가능" },
            { cat: "초도물품", desc: "식자재, 부자재", price: "300" },
            { cat: "로열티", desc: "정액제(한시적 프로모션)", price: "15" }
        ]
    },
    standard: {
        total: "3,780",
        info: "단위 : 만 원(10평 기준)",
        exclusion: "*별도사항 : 철거, 전기증설, 소방, 냉난방기, 외부 필름 시공, 어닝, 가구, 설비 공사, 지방 경비, 포스기, 키오스크 등(매장 상황에 따라 다를 수 있음)",
        items: [
            { cat: "가맹비", desc: "브랜드 사용권 / 영업지역 보장", price: "500", note: "<span class='promo-badge'>50호점 한정</span>" },
            { cat: "교육비", desc: "레시피 전수 / 매장 운영 교육 / 오픈바이징", price: "500", note: "<span class='promo-badge'>50호점 한정</span>" },
            { cat: "물류/계약이행보증금", desc: "오픈 및 영업 이행 담보 보증(계약 종료 시 환급)", price: "면제" },
            { cat: "인테리어(기본) & 기기설비 및 집기", desc: "플렉스 간판, 도장, 바닥, 목공 / 크레페 기계, 반죽기, 커피머신, 제빙기, 냉장고, 냉동고 등", price: "2,480", note: "*일부 중고제품 기준 / 미보유 제품만 구매 가능" },
            { cat: "초도물품", desc: "식자재, 부자재", price: "300" },
            { cat: "로열티", desc: "정액제(한시적 프로모션)", price: "15" }
        ]
    },
    premium: {
        total: "6,480",
        info: "단위 : 만 원(20평 기준)",
        exclusion: "*별도사항 : 철거, 전기증설, 소방, 냉난방기, 외부 필름 시공, 어닝, 가구, 설비 공사, 지방 경비, 포스기, 키오스크 등(매장 상황에 따라 다를 수 있음)",
        items: [
            { cat: "가맹비", desc: "브랜드 사용권 / 영업지역 보장", price: "500", note: "<span class='promo-badge'>50호점 한정</span>" },
            { cat: "교육비", desc: "레시피 전수 / 매장 운영 교육 / 오픈바이징", price: "500", note: "<span class='promo-badge'>50호점 한정</span>" },
            { cat: "물류/계약이행보증금", desc: "오픈 및 영업 이행 담보 보증(계약 종료 시 환급)", price: "면제" },
            { cat: "인테리어(기본) & 기기설비 및 집기", desc: "플렉스 간판, 도장, 바닥, 목공 / 크레페 기계, 반죽기, 커피머신, 제빙기, 냉장고, 냉동고 등", price: "5,180", note: "*일부 중고제품 기준 / 미보유 제품만 구매 가능" },
            { cat: "초도물품", desc: "식자재, 부자재", price: "300" },
            { cat: "로열티", desc: "정액제(한시적 프로모션)", price: "15" }
        ]
    }
};

const updatePackageTable = (pkgKey) => {
    const data = packageData[pkgKey];
    const tbody = document.getElementById('package-table-body');
    const totalAmount = document.getElementById('total-amount');
    const totalInfo = document.getElementById('total-info-text');
    const exclusionText = document.getElementById('exclusion-text');

    if (!tbody || !totalAmount) return;

    tbody.innerHTML = '';

    data.items.forEach(item => {
        const tr = document.createElement('tr');
        tr.classList.add('cost-row');

        let priceHtml = '';
        if (item.original) {
            priceHtml = '<span class="original">' + item.original + '</span><span class="highlight">' + item.price + '</span>';
        } else {
            priceHtml = '<span class="highlight">' + item.price + '</span>';
        }

        const noteHtml = item.note ? '<span class="note">' + item.note + '</span>' : '';

        tr.innerHTML = '<td class="category-cell">' + item.cat + '</td>' +
            '<td class="desc-cell">' + item.desc + ' ' + noteHtml + '</td>' +
            '<td class="price-cell">' + priceHtml + '</td>';
        tbody.appendChild(tr);
    });

    const currentTotal = parseInt(totalAmount.innerText.replace(/,/g, ''));
    const targetTotal = parseInt(data.total.replace(/,/g, ''));

    gsap.to(totalAmount, {
        duration: 1,
        innerText: targetTotal,
        roundProps: "innerText",
        ease: "power2.inOut",
        onUpdate: function () {
            const self = this;
            totalAmount.innerText = Math.ceil(self.targets()[0].innerText).toLocaleString();
        }
    });

    totalInfo.innerText = data.info;
    if (exclusionText) exclusionText.innerText = data.exclusion;

    gsap.from("#package-table-body tr", {
        opacity: 0,
        y: 10,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.out"
    });
};

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updatePackageTable(btn.getAttribute('data-pkg'));
    });
});

updatePackageTable('trans');

// 7. 창업 절차 타임라인 애니메이션
const procedureTl = gsap.timeline({
    scrollTrigger: { trigger: ".procedure-section", start: "top 90%", toggleActions: "play none none reverse" }
});
document.querySelectorAll(".procedure-item").forEach((step, index) => {
    procedureTl.fromTo(step, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8,
        onStart: () => step.classList.add("active"),
        ease: "power2.out"
    }, index * 0.2);
});

// 7.5. 신뢰 요약 (Trust Summary) 애니메이션
const trustSummaryTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".trust-summary-section",
        start: "top 90%",
        toggleActions: "play none none reverse"
    }
});

trustSummaryTl
    .to(".summary-quote-item", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.25,
        ease: "power4.out"
    })
    .to(".main-hashtag-group", {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: "back.out(1.5)"
    }, "-=0.8")
    .to(".sub-hash", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
    }, "-=0.6");

// 8. 문의하기 및 모달 제어
gsap.from(".inquiry-box", {
    scrollTrigger: { trigger: ".inquiry-section", start: "top 85%", toggleActions: "play none none reverse" },
    y: 50, opacity: 0, duration: 1, ease: "power3.out"
});

// 9. 비하인드 스토리 (Behind Story) 스크롤 애니메이션 고도화 (GSAP 3D 스프링 덤블링 및 실시간 성장 축 연동)
const streamWrapper = document.querySelector('.trust-stream-wrapper');
if (streamWrapper) {
    // 1) 배경 실린더 축 높이를 마지막 카드 높이까지 동적으로 맞추는 계산
    const backgroundAxis = streamWrapper.querySelector('.growth-axis');
    const updateAxisHeight = () => {
        const isMobile = window.innerWidth <= 768;
        const allCards = streamWrapper.querySelectorAll('.story-card');
        const lastCard = allCards[allCards.length - 1];
        if (lastCard && backgroundAxis) {
            const wrapperRect = streamWrapper.getBoundingClientRect();
            const cardRect = lastCard.getBoundingClientRect();
            // 마지막 카드의 정중앙 지점까지 높이를 확보
            const targetHeight = cardRect.top - wrapperRect.top + (cardRect.height / 2);
            backgroundAxis.style.height = targetHeight + 'px';
        }
    };
    updateAxisHeight();
    window.addEventListener('resize', updateAxisHeight, { passive: true });

    // 2) 중앙 성장 축 선(.axis-line)과 로고 마커(.axis-logo-marker)를 스크롤 진척도에 따라 아래로 드로잉 및 하강
    gsap.timeline({
        scrollTrigger: {
            trigger: streamWrapper,
            start: "top 75%",
            end: "bottom 85%",
            scrub: 1.5 // 스크롤 흐름에 쫀득하게 달라붙는 이펙트
        }
    })
    .fromTo(".axis-line", { height: "0%" }, { height: "100%", ease: "none" }, 0)
    .fromTo(".axis-logo-marker", { top: "0%" }, { top: "100%", ease: "none" }, 0);

    // 3) 개별 카드가 스크롤에 맞춰 퐁! 튕기며 3D 입체 등장
    const cards = streamWrapper.querySelectorAll('.story-card');
    cards.forEach((card) => {
        const isLeft = card.classList.contains('left');
        
        gsap.fromTo(card,
            {
                opacity: 0,
                scale: 0.8,
                y: 50,
                rotationY: isLeft ? 15 : -15, // 좌우 대칭 입체 틸팅 대기
                transformOrigin: isLeft ? "right center" : "left center"
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                rotationY: 0,
                duration: 0.9,
                ease: "back.out(1.5)", // 튀어나오며 바운스되는 고성능 완화
                scrollTrigger: {
                    trigger: card,
                    start: "top 88%", // 화면 88% 높이에 닿는 순간 퐁!
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
}

// 9.5. 브랜드 스토리 텍스트 스크롤 하이라이트 리빌 (Scroll Reveal Highlight)
const revealText = document.querySelector('.story-desc');
if (revealText) {
    const originalHTML = revealText.innerHTML;
    // 태그 파괴 우려가 없는 안전한 문자열 치환 기법 (흰색 배경에 맞게 초기 대비 설정)
    const parts = originalHTML.split('<br>');
    const mappedParts = parts.map(part => {
        return part.split(' ').map(word => {
            if (!word) return '';
            return `<span class="reveal-word" style="opacity: 1; color: rgba(0, 0, 0, 0.15); display: inline-block; transition: color 0.4s;">${word}</span>`;
        }).join(' ');
    });
    revealText.innerHTML = mappedParts.join('<br>');

    gsap.to(revealText.querySelectorAll('.reveal-word'), {
        scrollTrigger: {
            trigger: revealText,
            start: "top 85%",
            end: "bottom 60%",
            scrub: 0.5,
        },
        color: (index, target) => {
            const text = target.textContent;
            // 흰색 배경 위에서 시인성을 확보하기 위해 브랜드 딥 로얄 블루(#013b8d) 포인트 컬러 적용
            if (text.includes('진심') || text.includes('신뢰') || text.includes('가족')) {
                return "#013b8d";
            }
            return "#222222"; // 일반 글자들은 선명하고 편안한 다크 그레이/차콜 블랙
        },
        stagger: 0.05,
        ease: "none"
    });
}

const storySection = document.querySelector('.behind-story-section');
if (storySection) storyObserver.observe(storySection);

// 10. 강제 리프레시 (정합성 확보)
ScrollTrigger.refresh();

// 창업 상담 신청 폼 제출 처리
const inquiryForm = document.getElementById('inquiry-form');
if (inquiryForm) {
    inquiryForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>전송 중...</span><i class="fas fa-spinner fa-spin"></i>';

        try {
            const formData = {
                name: document.getElementById('user_name').value,
                phone: document.getElementById('user_phone').value,
                email: '',
                region: document.getElementById('hope_area').value,
                budget: '',
                experience: '',
                path: '',
                message: ''
            };

            const response = await fetch('/api/consultation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                window.location.href = '/franchise/complete';
            } else {
                alert(result.message || '상담 신청 중 오류가 발생했습니다.');
            }
        } catch (error) {
            console.error('상담 신청 오류:', error);
            alert('상담 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

// 맨 위로 가기 버튼 기능
const scrollToTopBtn = document.getElementById('scroll-to-top');


// 스크롤 이벤트 감지
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

// 버튼 클릭 시 맨 위로 스크롤
scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// 하단 고정 문의 바 스크롤 및 포커싱 제어 로직 (readyState 검사로 실행 보장)
const initStickyBar = () => {
    const stickyBar = document.getElementById('sticky-inquiry-bar');
    if (stickyBar) {
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight;
            const winHeight = window.innerHeight;
            
            // 1) 400px 이상 스크롤이 내려갔을 때 노출
            const isScrolledPast = scrollY > 400;
            // 2) 하단 문의 폼 영역(바닥에서 약 950px 위 지점)에 진입하면 바가 가리지 않도록 숨김
            const isNearBottom = scrollY > (docHeight - winHeight - 950);
            
            if (isScrolledPast && !isNearBottom) {
                stickyBar.classList.add('active');
            } else {
                stickyBar.classList.remove('active');
            }
        }, { passive: true });
        
        // 간편 창업문의 버튼 스무스 스크롤 바인딩
        const btnBarSubmit = stickyBar.querySelector('.btn-bar-submit');
        if (btnBarSubmit) {
            btnBarSubmit.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById('inquiry-form');
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        }
    }
};

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initStickyBar);
} else {
    initStickyBar();
}

