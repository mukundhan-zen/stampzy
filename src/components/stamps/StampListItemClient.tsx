'use client'

import Image from "next/image"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { deleteStamp } from "@/app/stamps/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { FormError } from "@/components/auth/form-error"
import { FormSuccess } from "@/components/auth/form-success"

// Define a type for the stamp prop for better type safety
type Stamp = {
  id: string;
  name: string;
  thumbnail_url: string | null;
  purchase_date: string | null;
  valuation: number | null;
  status: string;
};

interface StampListItemClientProps {
  stamp: Stamp;
  onStampDeleted: (id: string) => void;
}

export function StampListItemClient({ stamp, onStampDeleted }: StampListItemClientProps) {
  const [error, setError] = useState<string | undefined>("")
  const [success, setSuccess] = useState<string | undefined>("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter();

  const handleDelete = () => {
    setError("")
    setSuccess("")

    startTransition(() => {
      deleteStamp(stamp.id).then((data) => {
        if (data.success) {
          setSuccess(data.message)
          onStampDeleted(stamp.id)
          router.refresh(); // to re-fetch the list on the page
        } else {
          setError(data.message)
        }
      })
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">{stamp.name}</CardTitle>
        <Badge variant={stamp.status === 'owned' ? 'secondary' : 'default'}>
          {stamp.status}
        </Badge>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="relative h-48 w-full overflow-hidden rounded-md">
          {stamp.thumbnail_url ? (
            <Image
              src={stamp.thumbnail_url}
              alt={stamp.name}
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <div className="bg-muted h-full w-full flex items-center justify-center">
              <span className="text-sm text-muted-foreground">No Image</span>
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground grid gap-1">
          <p><strong>Purchase Date:</strong> {stamp.purchase_date ? new Date(stamp.purchase_date).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Valuation:</strong> {stamp.valuation ? `$${stamp.valuation}` : 'N/A'}</p>
        </div>
        <FormError message={error} />
        <FormSuccess message={success} />
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button asChild variant="outline">
          <Link href={`/stamps/edit/${stamp.id}`}>Edit</Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this stamp
                and all its associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
