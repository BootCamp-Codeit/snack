"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  ShoppingCart,
  User,
  Package,
  ShoppingBag,
  ClipboardList,
  FileText,
  X,
} from "lucide-react";
import { clearAuthSession } from "@/lib/auth/clear-session";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

/** 로그인 PC GNB가 좁은 뷰포트에서 꽉 차기 전·줄바꿈 전에 모바일(햄버거) 헤더로 전환 — Tailwind `lg`와 동일 */
const HEADER_USE_MOBILE_NAV_QUERY = "(max-width: 1023px)";

/** 장바구니 GNB: 품목(줄) 개수 — 총 수량 합 아님 */
function CartNavBadge({ count }: { count: number }) {
  if (count < 1) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      aria-label={`장바구니 품목 ${label}개`}
      className="inline-flex min-h-[1.25rem] min-w-[1.25rem] items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-semibold text-white"
    >
      {label}
    </span>
  );
}

/** 로고 클릭: 비로그인 → 랜딩, 로그인 후 → 상품 리스트 */
const LOGO_HREF_LANDING = "/";
const LOGO_HREF_PRODUCT_LIST = "/productlist";

/** 주황 배경용 로고 (밝은색), 흰 배경용 로고 (주황). public/assets SVG 사용 */
const LOGO_LIGHT_SRC = "/assets/snack_logo_light.svg";
const LOGO_ORANGE_SRC = "/assets/snack_logo.svg";

const LOGO_LABEL = "Snack";
const LOGO_WHITE = "text-white text-3xl font-bold italic";
const LOGO_ORANGE = "text-[var(--primary-orange-400)] text-2xl font-bold italic";

/** 로고 이미지 (실패 시 텍스트 폴백). width/height 지정 시 해당 크기로 표시 */
function LogoImg({
  src,
  alt = "Snack",
  width,
  height = 32,
  variant = "orange",
  className,
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  variant?: "light" | "orange";
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const w = width ?? height * 4;
  const h = height;
  if (failed) {
    return (
      <span className={cn(variant === "light" ? LOGO_WHITE : LOGO_ORANGE, className)}>
        {LOGO_LABEL}
      </span>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      className={cn("object-contain", className)}
      style={{ width: `${w}px`, height: `${h}px` }}
      onError={() => setFailed(true)}
      unoptimized
    />
  );
}

export type HeaderRole = "member" | "admin" | "superAdmin";

/** 디바이스: PC / 모바일 */
export type HeaderDevice = "pc" | "mobile";

/** 통합 헤더 props: 로그인 여부 + 디바이스 + 권한으로 한 개 헤더로 관리 */
export interface HeaderProps {
  device: HeaderDevice;
  isLoggedIn: boolean;
  role?: HeaderRole;
  cartCount?: number;
  className?: string;
}

const NAV_BY_ROLE: Record<HeaderRole, { label: string; href: string; icon: React.ElementType }[]> = {
  member: [
    { label: "상품 리스트", href: "/productlist", icon: Package },
    { label: "구매 요청 내역", href: "/purchase-requests", icon: ClipboardList },
    { label: "상품 등록 내역", href: "/product-register-history", icon: ShoppingBag },
  ],
  admin: [
    { label: "상품 리스트", href: "/productlist", icon: Package },
    { label: "구매 요청 내역", href: "/purchase-requests", icon: ClipboardList },
    { label: "구매 요청 관리", href: "/admin/purchase-manage", icon: ClipboardList },
    { label: "구매 내역 확인", href: "/admin/purchase-history", icon: FileText },
    { label: "상품 등록 내역", href: "/product-register-history", icon: ShoppingBag },
  ],
  superAdmin: [
    { label: "상품 리스트", href: "/productlist", icon: Package },
    { label: "구매 요청 내역", href: "/purchase-requests", icon: ClipboardList },
    { label: "구매 요청 관리", href: "/admin/purchase-manage", icon: ClipboardList },
    { label: "구매 내역 확인", href: "/admin/purchase-history", icon: FileText },
    { label: "상품 등록 내역", href: "/product-register-history", icon: ShoppingBag },
    { label: "관리", href: "/members", icon: FileText },
  ],
};

/** 헤더 높이: 모바일 54px, 태블릿 64px, PC 88px. PC(1920px 기준) 좌우 패딩 120px */
const HEADER_HEIGHT_CLASS =
  "min-h-[54px] md:min-h-[64px] lg:min-h-[88px] flex items-center px-4 md:px-8 lg:px-[120px]";
/** GNB 왼쪽 영역(로고+네비) 간격 72px, 오른쪽 영역 간격 80px */
/** 헤더 아래 콘텐츠 영역 좌우 패딩: 최대 120px, 화면이 줄어들면 점점 감소 (clamp 24px~120px) */
export const CONTENT_PADDING_X = "px-[clamp(24px,6.25vw,120px)]";
/** 좁은 PC 뷰포트에서 메뉴·간격이 함께 줄어들도록 유동 간격 */
const GNB_LEFT_GAP = "gap-[clamp(24px,5vw,72px)]";
const GNB_RIGHT_GAP = "gap-[clamp(20px,5vw,80px)]";
/** 헤더 내부: PC(1920px~)에서만 최대 1680px·가운데 정렬 / 모바일·태블릿은 전체 너비 */
const HEADER_CONTAINER_CLASS = "w-full min-[1920px]:max-w-[1680px] min-[1920px]:mx-auto";

/** 현재 경로가 해당 href와 일치하거나 하위 경로인지 */
function isNavActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
}

function HeaderLogoutButton({
  className,
  children,
  onAfter,
}: {
  className?: string;
  children: ReactNode;
  onAfter?: () => void;
}) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        clearAuthSession();
        onAfter?.();
        router.push("/");
      }}
    >
      {children}
    </button>
  );
}

interface ClassNameProps {
  className?: string;
}

interface LandingHeaderProps extends ClassNameProps {
  actions?: { href: string; label: string }[];
  /** 모바일에서 로고만 가운데, 액션은 md 이상에서만 표시 */
  centerLogoOnMobile?: boolean;
  /** 기본: 랜딩(`/`) — 비로그인 헤더 */
  logoHref?: string;
}

export function LandingHeader({
  className = "",
  actions = [],
  centerLogoOnMobile = false,
  logoHref = LOGO_HREF_LANDING,
}: LandingHeaderProps) {
  const logo = (
    <LogoImg src={LOGO_LIGHT_SRC} alt="Snack" width={126} height={32} variant="light" />
  );

  return (
    <header className={cn("bg-[var(--primary-orange-400)]", HEADER_HEIGHT_CLASS, className)}>
      <div
        className={cn(
          "flex w-full items-center",
          centerLogoOnMobile ? "justify-center md:justify-between" : "justify-between",
          HEADER_CONTAINER_CLASS
        )}
      >
        <Link
          href={logoHref}
          className="inline-flex shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="랜딩으로 이동"
        >
          {logo}
        </Link>
        {actions.length > 0 ? (
          <div className="hidden items-center gap-4 md:flex lg:gap-6">
            {actions.map((action) => (
              <Link
                key={`${action.href}-${action.label}`}
                href={action.href}
                className="text-sm font-semibold text-white transition-opacity hover:opacity-80 lg:text-base"
              >
                {action.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function LoginHeader({ className = "" }: ClassNameProps) {
  return (
    <header className={cn("bg-[var(--primary-orange-400)]", HEADER_HEIGHT_CLASS, className)}>
      <div className={cn("flex items-center justify-between", HEADER_CONTAINER_CLASS)}>
        <Link
          href={LOGO_HREF_LANDING}
          className="inline-flex shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="랜딩으로 이동"
        >
          <LogoImg src={LOGO_LIGHT_SRC} alt="Snack" width={126} height={32} variant="light" />
        </Link>
        <div className={cn("flex min-w-0 items-center justify-end", GNB_RIGHT_GAP)}>
          <Link
            href="/login"
            className="text_header_nav_bold shrink-0 text-white transition-colors hover:text-white/80"
          >
            로그인
          </Link>
          <Link
            href="/signup/super-admin"
            className="text_header_nav_bold shrink-0 text-white transition-colors hover:text-white/80"
          >
            기본 당일권 회원가입
          </Link>
        </div>
      </div>
    </header>
  );
}



export function CenterHeader({ className = "" }: ClassNameProps) {
  return (
    <header className={cn("bg-[var(--primary-orange-400)]", HEADER_HEIGHT_CLASS, className)}>
      <div className={cn("flex items-center justify-center", HEADER_CONTAINER_CLASS)}>
        <Link
          href={LOGO_HREF_LANDING}
          className="inline-flex shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="랜딩으로 이동"
        >
          <LogoImg src={LOGO_LIGHT_SRC} alt="Snack" width={126} height={32} variant="light" />
        </Link>
      </div>
    </header>
  );
}

interface FullWidthCenterHeaderProps extends ClassNameProps {
  /** 기본: 랜딩(`/`) — 로그인·회원가입 등 비로그인 헤더 */
  logoHref?: string;
}

export function FullWidthCenterHeader({
  className = "",
  logoHref = LOGO_HREF_LANDING,
}: FullWidthCenterHeaderProps) {
  const logo = (
    <LogoImg src={LOGO_LIGHT_SRC} alt="Snack" width={126} height={32} variant="light" />
  );

  return (
    <header className={cn("bg-[var(--primary-orange-400)] w-full", HEADER_HEIGHT_CLASS, className)}>
      <div className={cn("flex items-center justify-center", HEADER_CONTAINER_CLASS)}>
        <Link
          href={logoHref}
          className="inline-flex shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          aria-label="랜딩으로 이동"
        >
          {logo}
        </Link>
      </div>
    </header>
  );
}

interface MobileHeaderProps extends ClassNameProps {
  cartCount?: number;
  isLoggedIn?: boolean;
  userRole?: HeaderRole;
}

export function MobileHeader({
  cartCount = 0,
  className = "",
  isLoggedIn = false,
  userRole = "member",
}: MobileHeaderProps) {
  const [open, setOpen] = useState(false);
  const navItems = NAV_BY_ROLE[userRole];

  return (
    <header
      className={cn(
        "background_background_400_b border-b border-gray-200",
        HEADER_HEIGHT_CLASS,
        "px-6",
        className
      )}
    >
      <div className={cn("flex items-center gap-6", HEADER_CONTAINER_CLASS)}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors p-1 shrink-0"
          aria-label="메뉴 열기"
        >
          <Menu className="w-6 h-6" />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <div className="fixed top-0 left-0 z-50 h-full w-[280px] max-w-[85vw] background_background_400_b shadow-lg flex flex-col">
              {/* 상단 우측 닫기 버튼 */}
              <div className="flex justify-end p-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-2 -mr-2 gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors"
                  aria-label="메뉴 닫기"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              {/* 메뉴 목록: 텍스트만, 구분선 없음 */}
              <nav className="flex flex-col px-5 pb-6 overflow-auto">
                {!isLoggedIn ? (
                  <>
                    <Link
                      href="/login"
                      className="py-4 gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors text-base"
                      onClick={() => setOpen(false)}
                    >
                      로그인
                    </Link>
                    <Link
                      href="/signup/super-admin"
                      className="py-4 gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors text-base"
                      onClick={() => setOpen(false)}
                    >
                      기본 당일권 회원가입
                    </Link>
                  </>
                ) : (
                  <>
                    {navItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="py-4 gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors text-base"
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <HeaderLogoutButton
                      className="py-4 gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors text-base w-full cursor-pointer text-left"
                      onAfter={() => setOpen(false)}
                    >
                      로그아웃
                    </HeaderLogoutButton>
                  </>
                )}
              </nav>
            </div>
          </>
        )}

        <Link
          href={isLoggedIn ? LOGO_HREF_PRODUCT_LIST : LOGO_HREF_LANDING}
          className="inline-flex shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-orange-400)]"
          aria-label={isLoggedIn ? "상품 리스트로 이동" : "랜딩으로 이동"}
        >
          <LogoImg
            src={LOGO_ORANGE_SRC}
            alt="Snack"
            width={80}
            height={50}
            variant="orange"
          />
        </Link>
        <div className="flex-1 min-w-0" aria-hidden />
        <div className="flex items-center gap-1 shrink-0">
            <Link
              href="/cart"
              className="relative p-2 gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors"
              aria-label={cartCount > 0 ? `장바구니, 품목 ${cartCount > 99 ? "99개 이상" : `${cartCount}개`}` : "장바구니"}
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 ? (
                <span className="absolute top-0.5 right-0.5 flex min-h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold leading-none text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/profile"
              className="p-2 gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors"
              aria-label="마이페이지"
            >
              <User className="w-6 h-6" />
            </Link>
          </div>
      </div>
    </header>
  );
}

interface DetailHeaderProps extends ClassNameProps {
  showMenu?: boolean;
  cartCount?: number;
}

export function DetailHeader({ cartCount = 0, className = "" }: DetailHeaderProps) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE.member;
  return (
    <header className={cn("background_background_400_b border-b border-gray-200", HEADER_HEIGHT_CLASS, className)}>
      <div className={cn("flex min-w-0 items-center justify-between gap-3", HEADER_CONTAINER_CLASS)}>
        <div
          className={cn(
            "flex min-w-0 flex-1 items-center overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            GNB_LEFT_GAP
          )}
        >
          <Link
            href={LOGO_HREF_PRODUCT_LIST}
            className="flex shrink-0 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-orange-400)]"
            aria-label="상품 리스트로 이동"
          >
            <LogoImg src={LOGO_ORANGE_SRC} alt="Snack" width={126} height={32} variant="orange" />
          </Link>
          <nav className={cn("flex shrink-0 flex-nowrap", GNB_LEFT_GAP)}>
            {items.map((item) => {
              const active = isNavActive(pathname ?? "", item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "shrink-0 text_header_nav_bold transition-colors",
                    active ? "primary_orange_400_t" : "gray_gray_400_t hover:!text-[var(--gray-gray-500)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className={cn("flex shrink-0 items-center", GNB_RIGHT_GAP)}>
          <Link
            href="/cart"
            className="flex shrink-0 items-center gap-1.5 text_header_nav_bold gray_gray_400_t transition-colors hover:!text-[var(--gray-gray-500)]"
          >
            Cart
            <CartNavBadge count={cartCount} />
          </Link>
          <Link
            href="/profile"
            className="shrink-0 text_header_nav_bold gray_gray_400_t transition-colors hover:!text-[var(--gray-gray-500)]"
          >
            Profile
          </Link>

          <HeaderLogoutButton className="shrink-0 cursor-pointer text_header_nav_bold gray_gray_400_t transition-colors hover:!text-[var(--gray-gray-500)]">
            Logout
          </HeaderLogoutButton>
        </div>
      </div>
    </header>
  );
}

interface AdminHeaderProps extends ClassNameProps {
  cartCount?: number;
}

export function AdminHeader({ cartCount = 0, className = "" }: AdminHeaderProps) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE.admin;
  return (
    <header className={cn("background_background_400_b border-b border-gray-200", HEADER_HEIGHT_CLASS, className)}>
      <div className={cn("flex items-center justify-between min-w-0", HEADER_CONTAINER_CLASS)}>
        <div className={cn("flex items-center min-w-0 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden", GNB_LEFT_GAP)}>
          <Link
            href={LOGO_HREF_PRODUCT_LIST}
            className="flex shrink-0 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-orange-400)]"
            aria-label="상품 리스트로 이동"
          >
            <LogoImg src={LOGO_ORANGE_SRC} alt="Snack" width={126} height={32} variant="orange" />
          </Link>
          <nav className={cn("flex flex-nowrap shrink-0", GNB_LEFT_GAP)}>
            {items.map((item) => {
              const active = isNavActive(pathname ?? "", item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "text_header_nav_bold transition-colors shrink-0",
                    active ? "primary_orange_400_t" : "gray_gray_400_t hover:!text-[var(--gray-gray-500)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className={cn("flex items-center shrink-0", GNB_RIGHT_GAP)}>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text_header_nav_bold gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors"
          >
            Cart
            <CartNavBadge count={cartCount} />
          </Link>
          <Link href="/profile" className="text_header_nav_bold gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors">
            Profile
          </Link>
          <HeaderLogoutButton className="cursor-pointer whitespace-nowrap text_header_nav_bold gray_gray_400_t transition-colors hover:!text-[var(--gray-gray-500)]">
            Logout
          </HeaderLogoutButton>
        </div>
      </div>
    </header>
  );
}

interface SuperAdminHeaderProps extends ClassNameProps {
  cartCount?: number;
}

export function SuperAdminHeader({ cartCount = 0, className = "" }: SuperAdminHeaderProps) {
  const pathname = usePathname();
  const items = NAV_BY_ROLE.superAdmin;
  return (
    <header className={cn("background_background_400_b border-b border-gray-200", HEADER_HEIGHT_CLASS, className)}>
      <div className={cn("flex items-center justify-between min-w-0", HEADER_CONTAINER_CLASS)}>
        <div className={cn("flex items-center min-w-0 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden", GNB_LEFT_GAP)}>
          <Link
            href={LOGO_HREF_PRODUCT_LIST}
            className="flex shrink-0 items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-orange-400)]"
            aria-label="상품 리스트로 이동"
          >
            <LogoImg src={LOGO_ORANGE_SRC} alt="Snack" width={126} height={32} variant="orange" />
          </Link>
          <nav className={cn("flex flex-nowrap shrink-0", GNB_LEFT_GAP)}>
            {items.map((item) => {
              const active = isNavActive(pathname ?? "", item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "text_header_nav_bold transition-colors shrink-0",
                    active ? "primary_orange_400_t" : "gray_gray_400_t hover:!text-[var(--gray-gray-500)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className={cn("flex items-center shrink-0", GNB_RIGHT_GAP)}>
          <Link
            href="/cart"
            className="flex items-center gap-1.5 text_header_nav_bold gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors"
          >
            Cart
            <CartNavBadge count={cartCount} />
          </Link>
          <Link href="/profile" className="text_header_nav_bold gray_gray_400_t hover:!text-[var(--gray-gray-500)] transition-colors">
            Profile
          </Link>
          <HeaderLogoutButton className="cursor-pointer whitespace-nowrap text_header_nav_bold gray_gray_400_t transition-colors hover:!text-[var(--gray-gray-500)]">
            Logout
          </HeaderLogoutButton>
        </div>
      </div>
    </header>
  );
}

/**
 * 통합 헤더: 로그인 여부 + 디바이스 + 권한으로 하나로 관리
 * - 비로그인 PC → LoginHeader
 * - 비로그인 MO → CenterHeader (주황 배경, 가운데 로고)
 * - 로그인 MO 회원/관리자/최고관리자 → MobileHeader
 * - 로그인 PC 회원/관리자/최고관리자 → DetailHeader / AdminHeader / SuperAdminHeader
 * - 로그인 상태에서 뷰포트가 `lg` 미만이면(1023px 이하) PC GNB 대신 항상 MobileHeader
 * - 로고 링크: 비로그인 → `/`, 로그인 후 → `/productlist` (LandingHeader·FullWidthCenterHeader는 비로그인 기본 `/`)
 */
export function Header({
  device,
  isLoggedIn,
  role = "member",
  cartCount = 0,
  className = "",
}: HeaderProps) {
  const useMobileNavLayout = useMediaQuery(HEADER_USE_MOBILE_NAV_QUERY);

  if (!isLoggedIn) {
    if (device === "mobile") return <CenterHeader className={className} />;
    return <LoginHeader className={className} />;
  }

  if (device === "mobile" || useMobileNavLayout) {
    return (
      <MobileHeader isLoggedIn userRole={role} cartCount={cartCount} className={className} />
    );
  }

  if (role === "member") return <DetailHeader cartCount={cartCount} className={className} />;
  if (role === "admin") return <AdminHeader cartCount={cartCount} className={className} />;
  return <SuperAdminHeader cartCount={cartCount} className={className} />;
}
