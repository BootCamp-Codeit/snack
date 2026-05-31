import { BudgetForm } from "./_components/budget-form"

export default function BudgetManagementPage() {
  return (
    <main className="mx-auto w-full max-w-[640px] px-4 py-10">
      <h1 className="mb-10 text-center text-[32px] font-bold">예산 관리</h1>
      <BudgetForm />
    </main>
  )
}
