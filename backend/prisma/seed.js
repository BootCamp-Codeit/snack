/**
 * 포트폴리오 데모 시드 — 전체 삭제 후 재생성
 * 로컬: cd backend && npm run db:seed
 * EC2:  docker exec snack-api node prisma/seed.js
 */
require('dotenv/config');
const bcrypt = require('bcrypt');
const { createHash, randomBytes } = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const {
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
} = require('./seed-data');

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 12);
const SHIPPING_DEFAULT = 3000;

function parseDatabaseUrl(url) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port, 10) || 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, '').split('?')[0],
  };
}

function createPrisma() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set. See backend/.env.example');
  }
  const { host, port, user, password, database } = parseDatabaseUrl(databaseUrl);
  const adapter = new PrismaMariaDb({
    host,
    port,
    user,
    password,
    database,
    allowPublicKeyRetrieval: true,
    connectTimeout: 10_000,
  });
  return new PrismaClient({ adapter });
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function prevMonth(year, month, offset = 1) {
  let y = year;
  let m = month - offset;
  while (m <= 0) {
    m += 12;
    y -= 1;
  }
  return { year: y, month: m };
}

function lineTotal(price, qty) {
  return Number(price) * qty;
}

async function clearAll(prisma) {
  await prisma.purchase_order_items.deleteMany();
  await prisma.purchase_order_decisions.deleteMany();
  await prisma.expenses.deleteMany();
  await prisma.budget_reservations.deleteMany();
  await prisma.purchase_orders.deleteMany();
  await prisma.purchase_request_items.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.audit_logs.deleteMany();
  await prisma.auth_sessions.deleteMany();
  await prisma.budget_periods.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.password_reset_tokens.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany({ where: { parentId: { not: null } } });
  await prisma.category.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
}

async function seedCategories(prisma, organizationId) {
  const categoryByKey = new Map();
  let majorOrder = 0;

  for (const { major, minors } of DEFAULT_CATEGORY_TREE) {
    const parent = await prisma.category.create({
      data: {
        organizationId,
        parentId: null,
        name: major,
        sortOrder: majorOrder,
        isActive: true,
      },
    });
    majorOrder += 1;
    categoryByKey.set(major, parent.id);

    let minorOrder = 0;
    for (const minor of minors) {
      const child = await prisma.category.create({
        data: {
          organizationId,
          parentId: parent.id,
          name: minor,
          sortOrder: minorOrder,
          isActive: true,
        },
      });
      categoryByKey.set(`${major}::${minor}`, child.id);
      minorOrder += 1;
    }
  }

  return categoryByKey;
}

async function createOrgWithUsers(prisma, orgMeta, users, passwordHash) {
  const superAdmin = users.find((u) => u.role === 'SUPER_ADMIN');
  const others = users.filter((u) => u.role !== 'SUPER_ADMIN');

  const organization = await prisma.organization.create({
    data: {
      name: orgMeta.name,
      businessNumber: orgMeta.businessNumber,
      defaultMonthlyBudget: DEFAULT_MONTHLY_BUDGET,
      members: {
        create: {
          role: superAdmin.role,
          isActive: superAdmin.memberActive !== false,
          user: {
            create: {
              email: superAdmin.email,
              passwordHash,
              isActive: superAdmin.memberActive !== false,
              profile: { create: { displayName: superAdmin.displayName } },
            },
          },
        },
      },
    },
    include: { members: { include: { user: true } } },
  });

  const userByEmail = new Map();
  userByEmail.set(superAdmin.email, organization.members[0].user);

  for (const u of others) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        isActive: u.memberActive !== false,
        profile: { create: { displayName: u.displayName } },
      },
    });
    await prisma.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: u.role,
        isActive: u.memberActive !== false,
      },
    });
    userByEmail.set(u.email, user);
  }

  return { organization, userByEmail, creatorUserId: organization.members[0].user.id };
}

async function seedProducts(
  prisma,
  orgId,
  categoryByKey,
  userByEmail,
  products,
  metaByName = {},
) {
  const productByName = new Map();
  const creatorEmails = [...userByEmail.keys()];
  let rotate = 0;

  for (const item of products) {
    const categoryId = categoryByKey.get(`${item.major}::${item.minor}`);
    if (!categoryId) {
      throw new Error(`카테고리 없음: ${item.major} > ${item.minor}`);
    }

    const meta = metaByName[item.name] ?? {};
    const creatorEmail =
      meta.registeredBy ?? creatorEmails[rotate % creatorEmails.length];
    rotate += 1;
    const creator = userByEmail.get(creatorEmail);
    if (!creator) {
      throw new Error(`등록자 없음: ${creatorEmail}`);
    }

    const product = await prisma.product.create({
      data: {
        organizationId: orgId,
        categoryId,
        name: item.name,
        price: item.price,
        createdByUserId: creator.id,
        isActive: true,
        purchaseCountCache: meta.purchaseCount ?? 0,
      },
    });
    productByName.set(item.name, product);
  }

  return productByName;
}

async function seedUserCart(prisma, buyerOrgId, userId, productByName, items) {
  const cart = await prisma.cart.create({
    data: { organizationId: buyerOrgId, userId },
  });

  for (const { productName, quantity } of items) {
    const product = productByName.get(productName);
    if (!product) throw new Error(`장바구니 상품 없음: ${productName}`);
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: product.id, quantity },
    });
  }
}

async function createPurchaseScenario(
  prisma,
  {
    scenario,
    buyerOrgId,
    sellerOrgId,
    productByName,
    userByEmail,
    supplierUserId,
  },
) {
  const requester = userByEmail.get(scenario.requesterEmail);
  if (!requester) throw new Error(`요청자 없음: ${scenario.requesterEmail}`);

  const requestedAt = daysAgo(scenario.daysAgo);
  let totalAmount = 0;
  const lineItems = scenario.items.map(({ productName, quantity }) => {
    const product = productByName.get(productName);
    if (!product) throw new Error(`상품 없음: ${productName}`);
    const unit = Number(product.price);
    const line = lineTotal(unit, quantity);
    totalAmount += line;
    return { product, quantity, unit, line };
  });

  const shippingFee = scenario.shippingFee ?? SHIPPING_DEFAULT;
  const prData = {
    buyerOrganizationId: buyerOrgId,
    requesterUserId: requester.id,
    status: scenario.status,
    requestMessage: scenario.requestMessage,
    totalAmount,
    requestedAt,
    purchase_request_items: {
      create: lineItems.map(({ product, quantity, unit, line }) => ({
        seller_organization_id: sellerOrgId,
        product_id: product.id,
        product_name_snapshot: product.name,
        unit_price_snapshot: unit,
        quantity,
        line_total: line,
        created_at: requestedAt,
      })),
    },
  };

  if (scenario.status === 'CANCELED') {
    prData.canceledAt = daysAgo(Math.max(scenario.daysAgo - 1, 0));
  }

  const pr = await prisma.purchaseRequest.create({
    data: prData,
    include: { purchase_request_items: true },
  });

  if (scenario.poStatus === 'CANCELED') {
    return;
  }

  const itemsAmount = totalAmount;
  const poData = {
    purchase_request_id: pr.id,
    buyer_organization_id: buyerOrgId,
    seller_organization_id: sellerOrgId,
    status: scenario.poStatus,
    platform: scenario.platform,
    items_amount: itemsAmount,
    shipping_fee: shippingFee,
    created_at: requestedAt,
    updated_at: requestedAt,
  };

  if (scenario.externalOrderNo) {
    poData.external_order_no = scenario.externalOrderNo;
  }
  if (scenario.poStatus === 'APPROVED' || scenario.poStatus === 'PURCHASED') {
    poData.approved_at = daysAgo(Math.max(scenario.daysAgo - 1, 0));
  }
  if (scenario.poStatus === 'REJECTED') {
    poData.rejected_at = daysAgo(Math.max(scenario.daysAgo - 1, 0));
  }
  if (scenario.poStatus === 'PURCHASED') {
    poData.ordered_at = daysAgo(Math.max(scenario.daysAgo - 2, 0));
    poData.purchased_by_user_id = supplierUserId;
    poData.shipping_status = 'DELIVERED';
    poData.delivered_at = daysAgo(Math.max(scenario.daysAgo - 3, 0));
  }

  const po = await prisma.purchase_orders.create({ data: poData });

  for (const pri of pr.purchase_request_items) {
    const product = productByName.get(pri.product_name_snapshot);
    await prisma.purchase_order_items.create({
      data: {
        purchase_order_id: po.id,
        purchase_request_item_id: pri.id,
        product_id: product?.id ?? null,
        product_name_snapshot: pri.product_name_snapshot,
        unit_price_snapshot: pri.unit_price_snapshot,
        quantity: pri.quantity,
        line_total: pri.line_total,
        created_at: requestedAt,
      },
    });
  }

  if (scenario.poStatus === 'APPROVED' || scenario.poStatus === 'PURCHASED') {
    await prisma.purchase_order_decisions.create({
      data: {
        purchase_order_id: po.id,
        decided_by_user_id: supplierUserId,
        decision: 'APPROVED',
        decision_message: '예산 범위 내 요청으로 승인합니다.',
        decided_at: poData.approved_at,
      },
    });
  }

  if (scenario.poStatus === 'REJECTED') {
    await prisma.purchase_order_decisions.create({
      data: {
        purchase_order_id: po.id,
        decided_by_user_id: supplierUserId,
        decision: 'REJECTED',
        decision_message: scenario.rejectMessage,
        decided_at: poData.rejected_at,
      },
    });
  }

  const reservedAmount = itemsAmount + shippingFee;

  if (scenario.reservationStatus) {
    const reservationData = {
      buyer_organization_id: buyerOrgId,
      purchase_order_id: po.id,
      reserved_amount: reservedAmount,
      status: scenario.reservationStatus,
      created_by_user_id: supplierUserId,
      created_at: poData.approved_at ?? requestedAt,
    };
    if (scenario.reservationStatus === 'CONSUMED') {
      reservationData.consumed_at = poData.delivered_at ?? requestedAt;
    }
    await prisma.budget_reservations.create({ data: reservationData });
  }

  if (scenario.withExpense) {
    await prisma.expenses.create({
      data: {
        buyer_organization_id: buyerOrgId,
        purchase_order_id: po.id,
        purchase_request_id: pr.id,
        items_amount: itemsAmount,
        shipping_amount: shippingFee,
        amount: reservedAmount,
        expensed_at: poData.delivered_at ?? requestedAt,
        recorded_by_user_id: userByEmail.get('admin@snack.dev')?.id ?? requester.id,
        note: scenario.expenseNote ?? '5월 2주차 간식 지출 확정',
      },
    });
  }
}

async function seedInvitations(prisma, buyerOrgId, invitedByUserId, userByEmail) {
  for (const inv of INVITATIONS) {
    const rawToken = randomBytes(24).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = daysAgo(-7);
    const createdAt = daysAgo(inv.daysAgo);

    const data = {
      organizationId: buyerOrgId,
      email: inv.email,
      inviteeName: inv.inviteeName,
      tokenHash,
      status: inv.status,
      invitedByUserId,
      roleToGrant: inv.roleToGrant,
      expiresAt,
      createdAt,
    };

    if (inv.status === 'ACCEPTED' && inv.acceptedEmail) {
      const acceptedUser = userByEmail.get(inv.acceptedEmail);
      if (acceptedUser) {
        data.acceptedUserId = acceptedUser.id;
        data.acceptedAt = daysAgo(Math.max(inv.daysAgo - 2, 0));
      }
    }

    await prisma.invitation.create({ data });
  }
}

async function seedAuditLogs(prisma, buyerOrgId, sellerOrgId, userByEmail, supplierUserId) {
  const superAdmin = userByEmail.get('demo@snack.dev');
  const member = userByEmail.get('member@snack.dev');
  const admin = userByEmail.get('admin@snack.dev');

  const entries = [
    {
      organization_id: buyerOrgId,
      actor_user_id: member.id,
      action: 'PURCHASE_REQUEST_CREATE',
      target_type: 'purchase_request',
      message: '구매 요청 등록 — 신규 입사자 웰컴 키트',
      created_at: daysAgo(0),
    },
    {
      organization_id: sellerOrgId,
      actor_user_id: supplierUserId,
      action: 'PURCHASE_ORDER_APPROVE',
      target_type: 'purchase_order',
      message: '판매자 승인 — 주말 OT 간식',
      created_at: daysAgo(2),
    },
    {
      organization_id: buyerOrgId,
      actor_user_id: superAdmin.id,
      action: 'BUDGET_PERIOD_UPDATE',
      target_type: 'budget_period',
      message: '6월 월별 예산 50만원 설정',
      created_at: daysAgo(5),
    },
    {
      organization_id: buyerOrgId,
      actor_user_id: admin.id,
      action: 'PRODUCT_CREATE',
      target_type: 'product',
      message: '상품 등록 — 프링글스 오리지널',
      created_at: daysAgo(10),
    },
    {
      organization_id: buyerOrgId,
      actor_user_id: superAdmin.id,
      action: 'INVITATION_SEND',
      target_type: 'invitation',
      message: '초대 발송 — newhire@snack.dev',
      created_at: daysAgo(1),
    },
    {
      organization_id: buyerOrgId,
      actor_user_id: superAdmin.id,
      action: 'MEMBER_DEACTIVATE',
      target_type: 'organization_member',
      message: '멤버 비활성화 — left@snack.dev',
      created_at: daysAgo(15),
    },
  ];

  for (const entry of entries) {
    await prisma.audit_logs.create({ data: entry });
  }
}

async function main() {
  const prisma = createPrisma();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const prev = prevMonth(year, month, 1);
  const twoMonthsAgo = prevMonth(year, month, 2);

  try {
    console.log('🗑️  기존 데이터 삭제...');
    await clearAll(prisma);

    console.log('🏢 판매자 조직·공급 계정...');
    const seller = await createOrgWithUsers(
      prisma,
      SELLER_ORG,
      SELLER_USERS,
      passwordHash,
    );
    const sellerOrgId = seller.organization.id;
    const supplierUserId = seller.creatorUserId;

    console.log('🏢 구매자 조직·팀 계정 (%d명)...', BUYER_USERS.length);
    const buyer = await createOrgWithUsers(
      prisma,
      BUYER_ORG,
      BUYER_USERS,
      passwordHash,
    );
    const buyerOrgId = buyer.organization.id;
    const buyerUserByEmail = buyer.userByEmail;

    console.log('📂 구매자 카탈로그 (%d건 — 상품 리스트용)...', DEMO_PRODUCTS.length);
    const buyerCategories = await seedCategories(prisma, buyerOrgId);
    const buyerProductByName = await seedProducts(
      prisma,
      buyerOrgId,
      buyerCategories,
      buyerUserByEmail,
      DEMO_PRODUCTS,
      BUYER_PRODUCT_META,
    );

    console.log('📂 판매자 카탈로그 (%d건 — PO·공급용)...', DEMO_PRODUCTS.length);
    const sellerCategories = await seedCategories(prisma, sellerOrgId);
    const sellerProductByName = await seedProducts(
      prisma,
      sellerOrgId,
      sellerCategories,
      seller.userByEmail,
      DEMO_PRODUCTS,
      SELLER_PRODUCT_META,
    );

    console.log('💰 예산 (3개월)...');
    for (const { y, m, amount } of [
      { y: year, m: month, amount: CURRENT_MONTH_BUDGET },
      { y: prev.year, m: prev.month, amount: PREV_MONTH_BUDGET },
      { y: twoMonthsAgo.year, m: twoMonthsAgo.month, amount: TWO_MONTHS_AGO_BUDGET },
    ]) {
      await prisma.budget_periods.create({
        data: {
          organization_id: buyerOrgId,
          year: y,
          month: m,
          budget_amount: amount,
          created_by_user_id: buyer.creatorUserId,
        },
      });
    }

    console.log('🛒 장바구니 (member·admin)...');
    await seedUserCart(
      prisma,
      buyerOrgId,
      buyerUserByEmail.get('member@snack.dev').id,
      buyerProductByName,
      MEMBER_CART,
    );
    await seedUserCart(
      prisma,
      buyerOrgId,
      buyerUserByEmail.get('admin@snack.dev').id,
      buyerProductByName,
      ADMIN_CART,
    );

    console.log('📦 구매 요청 시나리오 %d건...', PURCHASE_SCENARIOS.length);
    for (const scenario of PURCHASE_SCENARIOS) {
      await createPurchaseScenario(prisma, {
        scenario,
        buyerOrgId,
        sellerOrgId,
        productByName: sellerProductByName,
        userByEmail: buyerUserByEmail,
        supplierUserId,
      });
      console.log('   ✓ %s (%s)', scenario.key, scenario.status);
    }

    console.log('✉️  초대 (%d건)...', INVITATIONS.length);
    await seedInvitations(
      prisma,
      buyerOrgId,
      buyerUserByEmail.get('demo@snack.dev').id,
      buyerUserByEmail,
    );

    console.log('📋 감사 로그...');
    await seedAuditLogs(
      prisma,
      buyerOrgId,
      sellerOrgId,
      buyerUserByEmail,
      supplierUserId,
    );

    console.log('');
    console.log('✅ 시드 완료');
    console.log('');
    console.log('── 구매자: %s', BUYER_ORG.name);
    console.log('   비밀번호 (공통): %s', DEMO_PASSWORD);
    for (const u of BUYER_USERS) {
      const tag = u.memberActive === false ? ' (비활성)' : '';
      console.log('   - %s (%s) [%s]%s', u.email, u.displayName, u.role, tag);
    }
    console.log(
      '   상품 %d건 | 장바구니 member %d + admin %d | 구매요청 %d건',
      DEMO_PRODUCTS.length,
      MEMBER_CART.length,
      ADMIN_CART.length,
      PURCHASE_SCENARIOS.length,
    );
    console.log('');
    console.log('── 판매자: %s', SELLER_ORG.name);
    for (const u of SELLER_USERS) {
      console.log('   - %s (%s) [%s]', u.email, u.displayName, u.role);
    }
    console.log('   상품 %d건', DEMO_PRODUCTS.length);
    console.log('');
    console.log('── 초대: 대기 %d건', INVITATIONS.filter((i) => i.status === 'PENDING').length);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('❌ 시드 실패:', err);
  process.exit(1);
});
