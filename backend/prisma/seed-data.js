/** 포트폴리오·리뷰용 데모 데이터 (npm run db:seed) */

const DEMO_PASSWORD = 'qwert12345!';

/** 구매자 조직 — FE 로그인 기본 */
const BUYER_ORG = {
  name: '코드잇 10기 마케팅팀',
  businessNumber: '123-45-67890',
};

/** 판매자(공급) 조직 — 상품·승인 데모 */
const SELLER_ORG = {
  name: 'Snack B2B 공급센터',
  businessNumber: '987-65-43210',
};

const DEFAULT_MONTHLY_BUDGET = 1_000_000;
const CURRENT_MONTH_BUDGET = 500_000;
const PREV_MONTH_BUDGET = 500_000;

/** buyer org 멤버 */
const BUYER_USERS = [
  { email: 'demo@snack.dev', displayName: '김명환', role: 'SUPER_ADMIN' },
  { email: 'admin@snack.dev', displayName: '이관리', role: 'ADMIN' },
  { email: 'member@snack.dev', displayName: '박멤버', role: 'MEMBER' },
];

/** seller org — 판매자 승인·PO 화면용 */
const SELLER_USERS = [
  { email: 'supplier@snack.dev', displayName: '최공급', role: 'SUPER_ADMIN' },
];

const DEFAULT_CATEGORY_TREE = [
  {
    major: '스낵',
    minors: ['과자', '쿠키', '초콜릿류', '캔디류', '견과류'],
  },
  {
    major: '음료',
    minors: ['청량/탄산음료', '과즙음료', '커피', '두유/우유'],
  },
  {
    major: '생수',
    minors: ['생수', '스파클링'],
  },
  {
    major: '간편식',
    minors: ['봉지라면', '컵라면', '컵밥류', '요거트류'],
  },
];

const DEMO_PRODUCTS = [
  { major: '스낵', minor: '과자', name: '새우깡', price: 1500 },
  { major: '스낵', minor: '과자', name: '포카칩 오리지널', price: 1800 },
  { major: '스낵', minor: '과자', name: '꼬깔콘 고소한맛', price: 1700 },
  { major: '스낵', minor: '쿠키', name: '청우 오!그래놀라', price: 2200 },
  { major: '스낵', minor: '초콜릿류', name: '가나 초콜릿', price: 1200 },
  { major: '스낵', minor: '캔디류', name: '츄파춥스', price: 500 },
  { major: '스낵', minor: '견과류', name: '허니버터아몬드', price: 3500 },
  { major: '음료', minor: '청량/탄산음료', name: '칠성사이다', price: 1500 },
  { major: '음료', minor: '청량/탄산음료', name: '코카콜라', price: 1500 },
  { major: '음료', minor: '과즙음료', name: '게토레이', price: 1800 },
  { major: '음료', minor: '커피', name: '맥심 TOP 스위트 아메리카노', price: 1200 },
  { major: '음료', minor: '두유/우유', name: '매일우유', price: 1300 },
  { major: '생수', minor: '생수', name: '삼다수', price: 900 },
  { major: '생수', minor: '스파클링', name: '트레비 레몬', price: 1200 },
  { major: '간편식', minor: '봉지라면', name: '신라면', price: 1100 },
  { major: '간편식', minor: '봉지라면', name: '진라면 매운맛', price: 1000 },
  { major: '간편식', minor: '컵라면', name: '너구리 컵', price: 1400 },
  { major: '간편식', minor: '컵밥류', name: '비빔밥 컵밥', price: 3200 },
  { major: '간편식', minor: '요거트류', name: '빙그레 바나나맛우유', price: 1400 },
  { major: '스낵', minor: '과자', name: '맛동산', price: 1600 },
  { major: '스낵', minor: '쿠키', name: '마리', price: 1300 },
  { major: '음료', minor: '과즙음료', name: '델몬트 오렌지', price: 1600 },
  { major: '생수', minor: '생수', name: '아이시스 2L', price: 1400 },
  { major: '간편식', minor: '컵라면', name: '열라면 컵', price: 1300 },
];

/** member 장바구니 (아직 구매 요청 전) */
const MEMBER_CART = [
  { productName: '새우깡', quantity: 3 },
  { productName: '칠성사이다', quantity: 2 },
  { productName: '신라면', quantity: 5 },
];

/** 구매 요청 시나리오 — 채용 담당자가 흐름을 한눈에 보기 위함 */
const PURCHASE_SCENARIOS = [
  {
    key: 'completed',
    daysAgo: 14,
    requestMessage: '5월 2주차 팀 간식 — 회의실 비치용',
    status: 'PURCHASED',
    poStatus: 'PURCHASED',
    platform: 'COUPANG',
    externalOrderNo: 'CP-20260517-8842',
    shippingFee: 3000,
    items: [
      { productName: '포카칩 오리지널', quantity: 5 },
      { productName: '게토레이', quantity: 10 },
    ],
    reservationStatus: 'CONSUMED',
    withExpense: true,
    requesterEmail: 'member@snack.dev',
  },
  {
    key: 'approved',
    daysAgo: 3,
    requestMessage: '주말 OT 간식 — 승인 완료, 발주 대기',
    status: 'READY_TO_PURCHASE',
    poStatus: 'APPROVED',
    platform: 'NAVER',
    shippingFee: 2500,
    items: [
      { productName: '허니버터아몬드', quantity: 2 },
      { productName: '맥심 TOP 스위트 아메리카노', quantity: 4 },
    ],
    reservationStatus: 'ACTIVE',
    withExpense: false,
    requesterEmail: 'admin@snack.dev',
  },
  {
    key: 'pending',
    daysAgo: 0,
    requestMessage: '신규 입사자 웰컴 키트',
    status: 'OPEN',
    poStatus: 'PENDING_SELLER_APPROVAL',
    platform: 'OTHER',
    shippingFee: 0,
    items: [{ productName: '너구리 컵', quantity: 6 }],
    reservationStatus: null,
    withExpense: false,
    requesterEmail: 'member@snack.dev',
  },
  {
    key: 'rejected',
    daysAgo: 7,
    requestMessage: '전사 행사용 — 수량 과다',
    status: 'REJECTED',
    poStatus: 'REJECTED',
    platform: 'OTHER',
    shippingFee: 0,
    rejectMessage: '월 예산 대비 수량이 과다합니다. ADMIN과 상의 후 재요청해 주세요.',
    items: [{ productName: '코카콜라', quantity: 50 }],
    reservationStatus: null,
    withExpense: false,
    requesterEmail: 'member@snack.dev',
  },
];

const PENDING_INVITATION = {
  email: 'newhire@snack.dev',
  inviteeName: '정신입',
  roleToGrant: 'MEMBER',
};

module.exports = {
  DEMO_PASSWORD,
  BUYER_ORG,
  SELLER_ORG,
  DEFAULT_MONTHLY_BUDGET,
  CURRENT_MONTH_BUDGET,
  PREV_MONTH_BUDGET,
  BUYER_USERS,
  SELLER_USERS,
  DEFAULT_CATEGORY_TREE,
  DEMO_PRODUCTS,
  MEMBER_CART,
  PURCHASE_SCENARIOS,
  PENDING_INVITATION,
  // 하위 호환
  DEMO_ORG_NAME: BUYER_ORG.name,
  DEMO_BUSINESS_NUMBER: BUYER_ORG.businessNumber,
  DEMO_USERS: BUYER_USERS,
};
