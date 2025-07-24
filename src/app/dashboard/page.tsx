
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getBudgetUsage } from "@/app/budgets/actions"
import { BudgetTrackerCard } from "@/components/budgets/BudgetTrackerCard"

export default async function DashboardPage() {
  const supabase = createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: usageData, error: usageError } = await getBudgetUsage()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BudgetTrackerCard usageData={usageData} error={usageError} />
        {/* Other dashboard cards can be added here */}
      </div>
    </div>
  )
}

