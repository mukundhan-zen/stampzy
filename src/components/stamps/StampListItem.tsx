'use client'

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Define a type for the stamp prop for better type safety
type Stamp = {
  id: string;
  name: string;
  thumbnail_url: string | null;
  purchase_date: string | null;
  valuation: number | null;
  status: string;
};

interface StampListItemProps {
  stamp: Stamp;
}

export function StampListItem({ stamp }: StampListItemProps) {
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
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button asChild variant="outline">
          <Link href={`/stamps/edit/${stamp.id}`}>Edit</Link>
        </Button>
        {/* Delete button will be wired up later */}
        <Button variant="destructive">Delete</Button>
      </CardFooter>
    </Card>
  )
}
