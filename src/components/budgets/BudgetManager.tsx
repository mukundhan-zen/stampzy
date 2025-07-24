'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BudgetForm } from './BudgetForm'

type Budget = {
  id: string;
  user_id: string;
  interval: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  start_date: string;
  created_at: string;
  updated_at: string;
};

interface BudgetManagerProps {
  budgets: Budget[] | null;
  tier: string | undefined;
}

export function BudgetManager({ budgets, tier }: BudgetManagerProps) {
  const [isFormVisible, setIsFormVisible] = useState(false)
  const existingBudget = budgets?.[0];

  const handleSuccess = () => {
    setIsFormVisible(false);
  }

  const canCreateBudget = tier !== 'free' || !existingBudget;

  if (existingBudget && !isFormVisible) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">Current Budget</h3>
          <p>Amount: ${existingBudget.amount}</p>
          <p>Interval: {existingBudget.interval}</p>
          <p>Start Date: {new Date(existingBudget.start_date).toLocaleDateString()}</p>
        </div>
        <Button onClick={() => setIsFormVisible(true)}>Edit Budget</Button>
      </div>
    )
  }

  if (isFormVisible) {
      return <BudgetForm defaultValues={existingBudget} onSuccess={handleSuccess} />
  }

  if (canCreateBudget) {
      return (
        <div className="text-center">
            <p className="mb-4">You haven't set a budget yet. Get started now.</p>
            <Button onClick={() => setIsFormVisible(true)}>Create Budget</Button>
        </div>
      )
  } else {
      return (
        <div>
            <p>Your current budget is shown above. Free tier users are limited to one budget.</p>
        </div>
      )
  }
}
