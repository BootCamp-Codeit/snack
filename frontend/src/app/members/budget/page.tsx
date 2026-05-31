import { BudgetForm } from "@/app/budget-mng/_components/budget-form"

export default function MembersBudgetPage() {
  return (
    <main className="px-4 py-8 min-[745px]:px-8 min-[745px]:py-14">
      <section className="mx-auto flex w-full max-w-[640px] flex-col items-center">
        <h1 className="text-center text-[28px] font-bold leading-[1.3] text-[#37352F] min-[745px]:text-[32px]">
          예산 관리
        </h1>
        <div className="mt-10 w-full min-[745px]:mt-12">
          <BudgetForm />
        </div>
      </section>
    </main>
  )
}
