'use client'

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormError } from "@/components/auth/form-error"
import { FormSuccess } from "@/components/auth/form-success"
// The actual server actions will be created in the next step.
// import { createStamp, updateStamp } from "@/app/stamps/actions"

const formSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().optional(),
  purchase_date: z.date().optional(),
  cost: z.coerce.number().optional(),
  seller: z.string().optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code.").optional(),
  valuation: z.coerce.number().optional(),
  status: z.enum(["owned", "sold"]).default("owned"),
})

// Define a type for the stamp data for props
type StampData = z.infer<typeof formSchema> & { id?: string };

interface StampFormProps {
  initialData?: StampData | null;
}

export function StampForm({ initialData }: StampFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      status: "owned",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      // Placeholder for server action call
      console.log("Form submitted", values);
      // const action = initialData
      //   ? updateStamp({ id: initialData.id!, ...values })
      //   : createStamp(values);

      // action.then((data) => {
      //   if (data.success) {
      //     setSuccess(initialData ? "Stamp updated successfully!" : "Stamp created successfully!");
      //     router.push('/stamps');
      //   } else {
      //     setError(data.message);
      //   }
      // });

      // Simulate success for now
      setSuccess(initialData ? "Stamp updated successfully! (Simulated)" : "Stamp created successfully! (Simulated)");
      setTimeout(() => router.push('/stamps'), 1000);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name / Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Penny Black" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Any details about the stamp..." {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="purchase_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Purchase Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isPending}
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
                      disabled={(date) =>
                        date > new Date() || date < new Date("1800-01-01")
                      }
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="owned">Owned</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Purchase Cost</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="10.00" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                            <Input placeholder="USD" {...field} maxLength={3} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="valuation"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Valuation</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="25.00" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        {/* Placeholder for Image Upload */}
        <div>
            <h3 className="text-lg font-medium">Images</h3>
            <div className="mt-4 p-6 border-dashed border-2 border-muted-foreground/50 rounded-lg text-center">
                <p className="text-muted-foreground">Image upload functionality will be here.</p>
                <p className="text-sm text-muted-foreground/80">Tier limits will be enforced.</p>
            </div>
        </div>

        <FormError message={error} />
        <FormSuccess message={success} />

        <Button type="submit" disabled={isPending}>
            {isPending ? (initialData ? 'Updating Stamp...' : 'Creating Stamp...') : (initialData ? 'Update Stamp' : 'Create Stamp')}
        </Button>
      </form>
    </Form>
  )
}
