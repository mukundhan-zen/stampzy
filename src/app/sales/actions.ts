'use server';

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const saleSchema = z.object({
  stampId: z.string().uuid(),
  quantitySold: z.coerce.number().int().min(1, "Quantity must be at least 1."),
  salePrice: z.coerce.number().min(0, "Sale price cannot be negative."),
  saleDate: z.date(),
  buyer: z.string().optional(),
});

export async function recordSale(values: z.infer<typeof saleSchema>) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "You must be logged in to record a sale." };
  }

  const validatedFields = saleSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: "Invalid data provided." };
  }

  const { stampId, quantitySold, salePrice, saleDate, buyer } = validatedFields.data;

  // 1. Fetch the stamp to verify ownership and quantity
  const { data: stamp, error: stampError } = await supabase
    .from("stamps")
    .select("id, quantity, cost, user_id")
    .eq("id", stampId)
    .single();

  if (stampError || !stamp) {
    return { success: false, message: "Stamp not found." };
  }

  if (stamp.user_id !== user.id) {
    return { success: false, message: "You are not authorized to sell this stamp." };
  }

  if (stamp.quantity < quantitySold) {
    return { success: false, message: `Cannot sell ${quantitySold} items. Only ${stamp.quantity} available.` };
  }

  // 2. Calculate proportional cost and profit/loss
  const costPerItem = (stamp.cost || 0) / stamp.quantity;
  const totalCostOfSoldItems = costPerItem * quantitySold;
  const profitLoss = salePrice - totalCostOfSoldItems;

  // 3. Update the stamp record
  const newQuantity = stamp.quantity - quantitySold;
  const newStatus = newQuantity === 0 ? 'sold' : 'owned';

  const { error: updateStampError } = await supabase
    .from("stamps")
    .update({
      quantity: newQuantity,
      status: newStatus,
    })
    .eq("id", stampId);

  if (updateStampError) {
    return { success: false, message: `Failed to update stamp: ${updateStampError.message}` };
  }

  // 4. Insert the sales record
  const { error: insertSaleError } = await supabase.from("sales").insert({
    stamp_id: stampId,
    user_id: user.id,
    quantity_sold: quantitySold,
    sale_price: salePrice,
    sale_date: saleDate.toISOString(),
    buyer: buyer,
    profit_loss: profitLoss,
  });

  if (insertSaleError) {
    // Attempt to revert the stamp update if the sale insert fails
    await supabase.from("stamps").update({ quantity: stamp.quantity, status: 'owned' }).eq("id", stampId);
    return { success: false, message: `Failed to record sale: ${insertSaleError.message}` };
  }

  // 5. Revalidate path to update UI
  revalidatePath("/stamps");

  return { success: true, message: "Sale recorded successfully!" };
}
