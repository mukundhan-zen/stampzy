'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RecordSaleForm } from './RecordSaleForm';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

// Assuming SaleFormValues is exported from RecordSaleForm
import type { SaleFormValues } from './RecordSaleForm';

interface Stamp {
  id: string;
  name: string;
  quantity: number;
}

interface RecordSaleDialogProps {
  stamp: Stamp;
  children: React.ReactNode; // The trigger element
  onSaleRecorded: () => void; // Callback to refresh data
}

export function RecordSaleDialog({ stamp, children, onSaleRecorded }: RecordSaleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (values: SaleFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('record-sale', {
        body: {
          stamp_id: stamp.id,
          sale_date: values.sale_date.toISOString(),
          sale_price: values.sale_price,
          quantity_sold: values.quantity_sold,
          buyer: values.buyer,
          notes: values.notes,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast.success(`Sale recorded for ${stamp.name}!`);
      setIsOpen(false);
      onSaleRecorded(); // Trigger data refresh in the parent component
    } catch (error: any) {
      toast.error('Failed to record sale.', {
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Record Sale for &quot;{stamp.name}&quot;</DialogTitle>
          <DialogDescription>
            Enter the details of the sale. Available quantity: {stamp.quantity}
          </DialogDescription>
        </DialogHeader>
        <RecordSaleForm
          stamp={stamp}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
