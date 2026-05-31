import Image from "next/image"
import Link from "next/link"
import { LandingHeader } from "@/components/header"
import { cn } from "@/lib/utils"

const TAGLINE =
  "흩어진 간식 구매처를 통합하고, 기수별 지출을 똑똑하게 관리하세요"

const BUBBLES = [
  "쉽고 빠르게 구매를 요청해보세요",
  "내가 원하는 간식을, 원하는 만큼!",
  "다양한 품목도 한 눈에 파악해요",
  "관리자와 유저 모두 이용 가능해요",
] as const

/** 모바일 말풍선 세로 순서 (인덱스) */
const BUBBLE_ORDER_MOBILE = [1, 3, 2, 0] as const

const CTAS = [
  { href: "/login", label: "로그인", mobileLabel: "로그인" },
  {
    href: "/signup/super-admin",
    label: "기업담당자 회원가입",
    mobileLabel: "관리자 회원가입",
  },
] as const

const ctaClass =
  "flex min-h-11 w-full items-center justify-center rounded-full border border-[#F97B22] bg-white px-5 py-3 text-sm font-semibold text-[#F97B22] transition-colors hover:bg-[#FFF3E8]"

function SpeechBubble({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div
        className={cn(
          "flex min-h-10 w-fit max-w-[min(100%,280px)] items-center justify-center rounded-full bg-[#F97B22] px-4 py-2",
          "md:min-h-[46px] md:max-w-[320px] md:px-5"
        )}
      >
        <p className="text-center text-[11px] font-semibold leading-snug text-white md:text-sm">
          {text}
        </p>
      </div>
      <div
        className="h-2.5 w-4 rotate-180 bg-[#F97B22] [clip-path:polygon(50%_0,0_100%,100%_100%)] md:h-3 md:w-[18px]"
        aria-hidden
      />
    </div>
  )
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen min-h-[100dvh] overflow-hidden bg-[#FDF0DF]">
      <LandingHeader
        className="absolute left-0 top-0 z-20 w-full"
        centerLogoOnMobile
        logoHref="/"
        actions={CTAS.map(({ href, label }) => ({ href, label }))}
      />

      <section
        className={cn(
          "relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[1920px] flex-col items-center px-5 text-center",
          "pt-[calc(54px+20px)] pb-[42vh] md:px-8 md:pt-[calc(64px+28px)] md:pb-[36vh]",
          "lg:pt-[calc(88px+32px)] lg:pb-[32vh] xl:pb-[34vh]"
        )}
      >
        <h1>
          <Image
            src="/assets/snack_logo.svg"
            alt="Snack"
            width={360}
            height={92}
            priority
            className="h-auto w-[200px] md:w-[280px] xl:w-[360px]"
          />
        </h1>

        <nav
          className="mt-6 flex w-full max-w-[320px] flex-col gap-3 md:hidden"
          aria-label="빠른 이동"
        >
          {CTAS.map(({ href, mobileLabel }) => (
            <Link key={href} href={href} className={ctaClass}>
              {mobileLabel}
            </Link>
          ))}
        </nav>

        <p className="mt-8 hidden max-w-[640px] rounded-full border border-[#F97B22]/35 bg-white/80 px-5 py-3 text-sm font-semibold text-[#E5762C] shadow-sm md:block md:text-base lg:text-lg xl:text-xl">
          {TAGLINE}
        </p>

        <ul className="mt-10 flex w-full max-w-[320px] flex-col items-center gap-5 md:hidden">
          {BUBBLE_ORDER_MOBILE.map((i) => (
            <li key={i}>
              <SpeechBubble text={BUBBLES[i]} />
            </li>
          ))}
        </ul>

        <div className="mt-10 hidden w-full max-w-[760px] flex-col gap-3 px-2 md:flex xl:hidden">
          <SpeechBubble text={BUBBLES[1]} className="self-end pr-[8%]" />
          <SpeechBubble text={BUBBLES[3]} className="self-start pl-[5%]" />
          <SpeechBubble text={BUBBLES[2]} className="self-end pr-[12%]" />
          <SpeechBubble text={BUBBLES[0]} className="self-center" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[5] hidden xl:block">
          <div className="absolute left-[10%] top-[43%]">
            <SpeechBubble text={BUBBLES[0]} />
          </div>
          <div className="absolute left-[3%] top-[60%]">
            <SpeechBubble text={BUBBLES[1]} />
          </div>
          <div className="absolute right-[10%] top-[43%]">
            <SpeechBubble text={BUBBLES[2]} />
          </div>
          <div className="absolute right-[3%] top-[60%]">
            <SpeechBubble text={BUBBLES[3]} />
          </div>
        </div>
      </section>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[44vh] md:h-[38vh] xl:h-[46vh]">
        <Image
          src="/assets/landing-bd.png"
          alt=""
          fill
          priority
          className="object-contain object-bottom mix-blend-multiply"
        />
      </div>
    </main>
  )
}
