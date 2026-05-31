"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderWithCart } from "@/components/header/header-with-cart";
import { useAuthHeader } from "@/hooks/use-auth-header";
import { cn } from "@/lib/utils";

export default function MembersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const { isLoggedIn, role } = useAuthHeader();

  const tabs = [
    {
      label: "회원 관리",
      href: "/members",
      active: pathname === "/members",
    },
    {
      label: "예산 관리",
      href: "/members/budget",
      active:
        pathname === "/members/budget" ||
        pathname.startsWith("/members/budget/"),
    },
  ];

  return (
    <>
      <div className="hidden min-[745px]:block">
        <HeaderWithCart device="pc" isLoggedIn={isLoggedIn} role={role} />
      </div>
      <div className="min-[745px]:hidden">
        <HeaderWithCart device="mobile" isLoggedIn={isLoggedIn} role={role} />
      </div>

      <nav className="h-16 border-b border-[var(--line-line-200)] bg-[var(--background-background-400)] px-4 min-[745px]:px-[clamp(24px,6.25vw,120px)]">
        <div className="mx-auto flex h-full w-full items-stretch gap-3 min-[1920px]:max-w-[1680px]">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative inline-flex h-full items-center px-[10px] py-[14px] text-[15px] font-semibold leading-6 transition-colors min-[745px]:text-base",
                tab.active
                  ? "bg-transparent text-[var(--primary-orange-400)] after:absolute after:bottom-0 after:left-[10px] after:right-[10px] after:h-[2px] after:bg-[var(--primary-orange-400)] after:content-['']"
                  : "bg-transparent text-[var(--gray-gray-400)] hover:text-[var(--black-black-300)]",
              )}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="min-[1920px]:mx-auto min-[1920px]:w-full min-[1920px]:max-w-[1680px]">
        {children}
      </div>
    </>
  );
}
