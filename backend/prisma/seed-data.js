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
const TWO_MONTHS_AGO_BUDGET = 450_000;

/** buyer org 멤버 — 회원 관리 화면용 */
const BUYER_USERS = [
  { email: 'demo@snack.dev', displayName: '김명환', role: 'SUPER_ADMIN' },
  { email: 'admin@snack.dev', displayName: '이관리', role: 'ADMIN' },
  { email: 'ops@snack.dev', displayName: '한운영', role: 'ADMIN' },
  { email: 'member@snack.dev', displayName: '박멤버', role: 'MEMBER' },
  { email: 'design@snack.dev', displayName: '최디자인', role: 'MEMBER' },
  { email: 'content@snack.dev', displayName: '정콘텐츠', role: 'MEMBER' },
  { email: 'intern@snack.dev', displayName: '강인턴', role: 'MEMBER' },
  { email: 'left@snack.dev', displayName: '조퇴사', role: 'MEMBER', memberActive: false },
];

/** seller org */
const SELLER_USERS = [
  { email: 'supplier@snack.dev', displayName: '최공급', role: 'SUPER_ADMIN' },
  { email: 'catalog@snack.dev', displayName: '오카탈로그', role: 'ADMIN' },
  { email: 'dispatch@snack.dev', displayName: '윤배송', role: 'MEMBER' },
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

/** 공통 카탈로그 — 구매자·판매자 조직 모두에 시드 (상품 리스트는 조직별 조회) */
const DEMO_PRODUCTS = [
  { major: '스낵', minor: '과자', name: '새우깡', price: 1500 },
  { major: '스낵', minor: '과자', name: '포카칩 오리지널', price: 1800 },
  { major: '스낵', minor: '과자', name: '꼬깔콘 고소한맛', price: 1700 },
  { major: '스낵', minor: '과자', name: '프링글스 오리지널', price: 2800 },
  { major: '스낵', minor: '과자', name: '맛동산', price: 1600 },
  { major: '스낵', minor: '과자', name: '오징어땅콩', price: 1400 },
  { major: '스낵', minor: '쿠키', name: '청우 오!그래놀라', price: 2200 },
  { major: '스낵', minor: '쿠키', name: '마리', price: 1300 },
  { major: '스낵', minor: '쿠키', name: '오REO 오리지널', price: 2400 },
  { major: '스낵', minor: '초콜릿류', name: '가나 초콜릿', price: 1200 },
  { major: '스낵', minor: '초콜릿류', name: '킷캣', price: 1100 },
  { major: '스낵', minor: '캔디류', name: '츄파춥스', price: 500 },
  { major: '스낵', minor: '캔디류', name: '자일리톨', price: 800 },
  { major: '스낵', minor: '견과류', name: '허니버터아몬드', price: 3500 },
  { major: '스낵', minor: '견과류', name: '고소한 땅콩', price: 2200 },
  { major: '음료', minor: '청량/탄산음료', name: '칠성사이다', price: 1500 },
  { major: '음료', minor: '청량/탄산음료', name: '코카콜라', price: 1500 },
  { major: '음료', minor: '청량/탄산음료', name: '펩시', price: 1500 },
  { major: '음료', minor: '과즙음료', name: '게토레이', price: 1800 },
  { major: '음료', minor: '과즙음료', name: '델몬트 오렌지', price: 1600 },
  { major: '음료', minor: '커피', name: '맥심 TOP 스위트 아메리카노', price: 1200 },
  { major: '음료', minor: '커피', name: 'TOP 라떼', price: 1300 },
  { major: '음료', minor: '두유/우유', name: '매일우유', price: 1300 },
  { major: '음료', minor: '두유/우유', name: '빙그레 바나나맛우유', price: 1400 },
  { major: '생수', minor: '생수', name: '삼다수', price: 900 },
  { major: '생수', minor: '생수', name: '아이시스 2L', price: 1400 },
  { major: '생수', minor: '스파클링', name: '트레비 레몬', price: 1200 },
  { major: '간편식', minor: '봉지라면', name: '신라면', price: 1100 },
  { major: '간편식', minor: '봉지라면', name: '진라면 매운맛', price: 1000 },
  { major: '간편식', minor: '컵라면', name: '너구리 컵', price: 1400 },
  { major: '간편식', minor: '컵라면', name: '열라면 컵', price: 1300 },
  { major: '간편식', minor: '컵밥류', name: '비빔밥 컵밥', price: 3200 },
  { major: '간편식', minor: '요거트류', name: '요플레 딸기', price: 1500 },
];

/** 상품 등록 내역·인기순 데모용 메타 (구매자 조직) */
const BUYER_PRODUCT_META = {
  '포카칩 오리지널': { registeredBy: 'admin@snack.dev', purchaseCount: 28 },
  '게토레이': { registeredBy: 'admin@snack.dev', purchaseCount: 22 },
  '새우깡': { registeredBy: 'member@snack.dev', purchaseCount: 15 },
  '허니버터아몬드': { registeredBy: 'ops@snack.dev', purchaseCount: 11 },
  '프링글스 오리지널': { registeredBy: 'admin@snack.dev', purchaseCount: 9 },
  '맥심 TOP 스위트 아메리카노': { registeredBy: 'content@snack.dev', purchaseCount: 18 },
  '신라면': { registeredBy: 'member@snack.dev', purchaseCount: 7 },
  '코카콜라': { registeredBy: 'design@snack.dev', purchaseCount: 5 },
};

/** 판매자 조직 상품 등록 내역 */
const SELLER_PRODUCT_META = {
  '포카칩 오리지널': { registeredBy: 'catalog@snack.dev', purchaseCount: 45 },
  '게토레이': { registeredBy: 'catalog@snack.dev', purchaseCount: 38 },
  '허니버터아몬드': { registeredBy: 'supplier@snack.dev', purchaseCount: 20 },
  '너구리 컵': { registeredBy: 'dispatch@snack.dev', purchaseCount: 14 },
  '칠성사이다': { registeredBy: 'catalog@snack.dev', purchaseCount: 30 },
};

/** 장바구니 — 구매자 조직 상품 ID 사용 */
const MEMBER_CART = [
  { productName: '새우깡', quantity: 3 },
  { productName: '칠성사이다', quantity: 2 },
  { productName: '신라면', quantity: 5 },
  { productName: '오REO 오리지널', quantity: 2 },
];

const ADMIN_CART = [
  { productName: '허니버터아몬드', quantity: 1 },
  { productName: 'TOP 라떼', quantity: 6 },
];

/** 구매 요청 시나리오 — 판매자 조직 상품 기준 (B2B PO 흐름) */
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
  {
    key: 'completed-2',
    daysAgo: 21,
    requestMessage: '4월 마케팅 워크숍 케이터링',
    status: 'PURCHASED',
    poStatus: 'PURCHASED',
    platform: 'SSG',
    externalOrderNo: 'SSG-20260410-3311',
    shippingFee: 3500,
    items: [
      { productName: '프링글스 오리지널', quantity: 4 },
      { productName: '삼다수', quantity: 12 },
    ],
    reservationStatus: 'CONSUMED',
    withExpense: true,
    requesterEmail: 'ops@snack.dev',
  },
  {
    key: 'canceled',
    daysAgo: 5,
    requestMessage: '행사 취소 — 간식 주문 철회',
    status: 'CANCELED',
    poStatus: 'CANCELED',
    platform: 'OTHER',
    shippingFee: 0,
    items: [{ productName: '비빔밥 컵밥', quantity: 8 }],
    reservationStatus: null,
    withExpense: false,
    requesterEmail: 'content@snack.dev',
  },
  {
    key: 'partial',
    daysAgo: 1,
    requestMessage: '디자인팀 브레인스토밍 다과',
    status: 'OPEN',
    poStatus: 'PENDING_SELLER_APPROVAL',
    platform: 'MARKET_KURLY',
    shippingFee: 3000,
    items: [
      { productName: '킷캣', quantity: 10 },
      { productName: '트레비 레몬', quantity: 6 },
    ],
    reservationStatus: null,
    withExpense: false,
    requesterEmail: 'design@snack.dev',
  },
];

const INVITATIONS = [
  {
    email: 'newhire@snack.dev',
    inviteeName: '정신입',
    roleToGrant: 'MEMBER',
    status: 'PENDING',
    daysAgo: 1,
  },
  {
    email: 'contractor@snack.dev',
    inviteeName: '김외주',
    roleToGrant: 'MEMBER',
    status: 'PENDING',
    daysAgo: 3,
  },
  {
    email: 'intern@snack.dev',
    inviteeName: '강인턴',
    roleToGrant: 'MEMBER',
    status: 'ACCEPTED',
    daysAgo: 30,
    acceptedEmail: 'intern@snack.dev',
  },
];

module.exports = {
  DEMO_PASSWORD,
  BUYER_ORG,
  SELLER_ORG,
  DEFAULT_MONTHLY_BUDGET,
  CURRENT_MONTH_BUDGET,
  PREV_MONTH_BUDGET,
  TWO_MONTHS_AGO_BUDGET,
  BUYER_USERS,
  SELLER_USERS,
  DEFAULT_CATEGORY_TREE,
  DEMO_PRODUCTS,
  BUYER_PRODUCT_META,
  SELLER_PRODUCT_META,
  MEMBER_CART,
  ADMIN_CART,
  PURCHASE_SCENARIOS,
  INVITATIONS,
  // 하위 호환
  PENDING_INVITATION: INVITATIONS[0],
  DEMO_ORG_NAME: BUYER_ORG.name,
  DEMO_BUSINESS_NUMBER: BUYER_ORG.businessNumber,
  DEMO_USERS: BUYER_USERS,
};
