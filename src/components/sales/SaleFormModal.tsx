'use client';

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "@radix-ui/react-icons";

import { recordSale } from "@/app/sales/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,  DialogContent,  DialogDescription,  DialogHeader,  DialogTitle,  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,  FormControl,  FormField,  FormItem,  FormLabel,  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,  PopoverContent,  PopoverTrigger,
} from "@/components/ui/popover";
import { FormError } from "@/components/auth/form-error";
import { FormSuccess } from "@/components/auth/form-success";

type Stamp = {
  id: string;
  quantity: number;
};

interface SaleFormModalProps {
  stamp: Stamp;
  children: React.ReactNode; // To trigger the dialog
}

export function SaleFormModal({ stamp, children }: SaleFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const saleSchema = z.object({
    saleDate: z.date({ required_error: "A sale date is required." }),
    salePrice: z.coerce.number().min(0, "Price must be a positive number."),
    quantitySold: z.coerce
      .number()
      .int()
      .min(1, "You must sell at least one item.")
      .max(stamp.quantity, `You can only sell up to ${stamp.quantity} items.`),
    buyer: z.string().optional(),
  });

  const form = useForm<z.infer<typeof saleSchema>>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      quantitySold: 1,
      salePrice: 0,
      buyer: "",
    },
  });

  const onSubmit = (values: z.infer<typeof saleSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      recordSale({ ...values, stampId: stamp.id })
        .then((data) => {
          if (data.success) {
            setSuccess(data.message);
            setTimeout(() => setIsOpen(false), 2000); // Close modal on success
          } else {
            setError(data.message);
          }
        })
        .catch(() => setError("An unexpected error occurred."));
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record a Sale</DialogTitle>
          <DialogDescription>
            Enter the details of the sale for this item.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="saleDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Date</FormLabel>
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
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
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
            <FormField
              control={form.control}
              name="quantitySold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity Sold</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Sale Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buyer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Buyer (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Recording Sale..." : "Record Sale"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
