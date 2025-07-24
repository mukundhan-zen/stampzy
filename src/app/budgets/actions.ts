'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const BudgetSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.coerce.number().positive('Amount must be positive'),
  interval: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']),
  start_date: z.string(),
})

export async function getBudgets() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Authentication required' }
  }

  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }
  return { data }
}

export async function createBudget(formData: FormData) {
  const validatedFields = BudgetSchema.safeParse({
    amount: formData.get('amount'),
    interval: formData.get('interval'),
    start_date: formData.get('start_date'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields', details: validatedFields.error.flatten().fieldErrors }
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Authentication required' }
  }

  // Tier enforcement: For simplicity, we'll assume free users can have up to 4 budgets.
  const { count, error: countError } = await supabase
    .from('budgets')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)

  const { data: profile } = await supabase.from('profiles').select('tier').eq('id', user.id).single();

  if (profile?.tier === 'free' && count && count >= 1) {
      return { error: 'Free users can only have one budget. Please upgrade to create more.' };
  }

  const { amount, interval, start_date } = validatedFields.data

  const { error } = await supabase.from('budgets').insert([{ 
    user_id: user.id, 
    amount, 
    interval,
    start_date,
  }])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/budgets')
  return { message: 'Budget created successfully' }
}


export async function getBudgetUsage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Authentication required' }
  }

  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (budgetError || !budget) {
    return { error: 'No budget found. Please create one first.' }
  }

  const { amount, interval, start_date } = budget;
  const today = new Date();
  let periodStart, periodEnd;

  const startDate = new Date(start_date);

  switch (interval) {
    case 'weekly':
      periodStart = new Date(today);
      const dayOfWeek = today.getDay();
      const startOfWeek = startDate.getDay();
      const diff = (dayOfWeek < startOfWeek) ? (dayOfWeek - startOfWeek + 7) : (dayOfWeek - startOfWeek);
      periodStart.setDate(today.getDate() - diff);
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodStart.getDate() + 6);
      break;
    case 'monthly':
      const month = today.getMonth();
      const year = today.getFullYear();
      periodStart = new Date(year, month, startDate.getDate());
      if(periodStart > today) {
        periodStart = new Date(year, month - 1, startDate.getDate());
      }
      periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, periodStart.getDate() - 1);
      break;
    case 'quarterly':
        const quarter = Math.floor(today.getMonth() / 3);
        const quarterStartMonth = quarter * 3;
        periodStart = new Date(today.getFullYear(), quarterStartMonth, startDate.getDate());
         if(periodStart > today) {
            periodStart = new Date(today.getFullYear() -1, quarterStartMonth, startDate.getDate());
        }
        periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 3, periodStart.getDate() - 1);
      break;
    case 'yearly':
      periodStart = new Date(today.getFullYear(), startDate.getMonth(), startDate.getDate());
       if(periodStart > today) {
          periodStart = new Date(today.getFullYear() - 1, startDate.getMonth(), startDate.getDate());
      }
      periodEnd = new Date(periodStart.getFullYear() + 1, periodStart.getMonth(), periodStart.getDate() - 1);
      break;
    default:
      return { error: 'Invalid budget interval' };
  }

  const periodStartISO = periodStart.toISOString().split('T')[0];
  const periodEndISO = periodEnd.toISOString().split('T')[0];

  const { data: stamps, error: stampsError } = await supabase
    .from('stamps')
    .select('cost')
    .eq('user_id', user.id)
    .gte('purchase_date', periodStartISO)
    .lte('purchase_date', periodEndISO);

  if (stampsError) {
    return { error: `Failed to fetch spending data: ${stampsError.message}` }
  }

  const spentAmount = stamps.reduce((acc, stamp) => acc + (stamp.cost || 0), 0);
  const remainingAmount = amount - spentAmount;
  const percentageUsed = amount > 0 ? (spentAmount / amount) * 100 : 0;

  return {
    data: {
      budgetAmount: amount,
      spentAmount,
      remainingAmount,
      percentageUsed,
      periodStart: periodStartISO,
      periodEnd: periodEndISO,
      interval,
    }
  }
}
