
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBudgets } from "./actions";
import { BudgetManager } from "@/components/budgets/BudgetManager";

export default async function BudgetsPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const { data: budgets } = await getBudgets();
  const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single();

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <Card>
          <CardHeader className="px-7">
            <CardTitle>Budgets</CardTitle>
            <CardDescription>Manage your spending budgets.</CardDescription>
          </CardHeader>
          <CardContent>
            <BudgetManager budgets={budgets} tier={profile?.tier} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
