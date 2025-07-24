'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { createBudget, updateBudget } from "@/app/budgets/actions"
import { useTransition } from "react"
import { toast } from "sonner"

const BudgetFormSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.coerce.number().positive({ message: "Amount must be a positive number." }),
  interval: z.enum(['weekly', 'monthly', 'quarterly', 'yearly'], { message: "Please select a valid interval." }),
  start_date: z.date({ message: "Please select a start date." }),
})

type BudgetFormValues = z.infer<typeof BudgetFormSchema>

interface BudgetFormProps {
  defaultValues?: Partial<BudgetFormValues> & { id?: string };
  onSuccess?: () => void;
}

export function BudgetForm({ defaultValues, onSuccess }: BudgetFormProps) {
  const [isPending, startTransition] = useTransition()
  const isEditing = !!defaultValues?.id;

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(BudgetFormSchema),
    defaultValues: {
      ...defaultValues,
      start_date: defaultValues?.start_date ? new Date(defaultValues.start_date) : new Date(),
    },
  })

  const onSubmit = (data: BudgetFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append('amount', data.amount.toString());
      formData.append('interval', data.interval);
      // Format date to ISO string without time for consistency
      formData.append('start_date', data.start_date.toISOString().split('T')[0]);
      
      if (isEditing && data.id) {
        formData.append('id', data.id);
      }

      const action = isEditing ? updateBudget : createBudget;
      const result = await action(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`Budget ${isEditing ? 'updated' : 'created'} successfully!`);
        onSuccess?.();
        if (!isEditing) {
            form.reset();
        }
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interval</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an interval" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="start_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>{isPending ? 'Saving...' : (isEditing ? 'Update Budget' : 'Create Budget')}</Button>
      </form>
    </Form>
  )
}
