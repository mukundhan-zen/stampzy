'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface BudgetUsageData {
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  periodStart: string;
  periodEnd: string;
  interval: string;
}

interface BudgetTrackerCardProps {
  usageData: BudgetUsageData | null;
  error?: string | null;
}

export function BudgetTrackerCard({ usageData, error }: BudgetTrackerCardProps) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!usageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No budget data available. Please set a budget first.</p>
        </CardContent>
      </Card>
    )
  }

  const {
    budgetAmount,
    spentAmount,
    remainingAmount,
    percentageUsed,
    periodStart,
    periodEnd,
    interval,
  } = usageData

  const formattedPeriod = `${new Date(periodStart).toLocaleDateString()} - ${new Date(periodEnd).toLocaleDateString()}`

  const getProgressColor = () => {
    if (percentageUsed >= 100) {
      return "bg-red-500"; // Exceeded budget
    }
    if (percentageUsed >= 80) {
      return "bg-yellow-500"; // Nearing budget
    }
    return "bg-primary"; // Default color
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Tracker</CardTitle>
        <CardDescription>
          Your {interval} spending for {formattedPeriod}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <div className="flex justify-between">
                <span className="font-medium">Spent</span>
                <span>${spentAmount.toFixed(2)}</span>
            </div>
            <Progress value={percentageUsed} className="w-full [&>div]:bg-primary" indicatorClassName={getProgressColor()} />
            <div className="flex justify-between text-sm text-muted-foreground">
                <span>Remaining: ${remainingAmount.toFixed(2)}</span>
                <span>Total Budget: ${budgetAmount.toFixed(2)}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
