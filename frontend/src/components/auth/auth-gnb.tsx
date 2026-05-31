import Link from "next/link"

export function AuthGnb() {
  return (
    <header className="absolute left-1/2 top-0 z-10 flex h-[54px] w-full -translate-x-1/2 items-center justify-center bg-[#F97B22] px-6 md:h-[64px] lg:h-[88px] md:px-12 xl:px-[120px]">
      <Link
        href="/productlist"
        className="absolute inset-0 flex items-center justify-center outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-white"
        aria-label="상품 목록으로 이동"
      >
        <span className="pointer-events-none font-[var(--font-snack-logo)] text-[24px] font-extrabold text-white">
          Snack
        </span>
      </Link>
    </header>
  )
}
