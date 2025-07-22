"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Stamp {
  id: string;
  name: string;
  purchase_date: Date;
  image_url: string;
  valuation: number;
  currency: string;
}

interface StampCardProps {
  stamp: Stamp;
  userTier: "free" | "paid";
}

export function StampCard({ stamp, userTier }: StampCardProps) {
  const isPaid = userTier === "paid";

  return (
    <Card className="flex flex-col overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105">
      <CardHeader className="p-0">
        <div className="relative w-full aspect-square">
          <Image
            src={stamp.image_url || "/placeholder.svg"}
            alt={`Image of ${stamp.name}`}
            fill
            className={cn(
              "object-cover",
              !isPaid && "filter grayscale blur-sm"
            )}
          />
          {!isPaid && (
             <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Badge variant="secondary">Upgrade to view</Badge>
             </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <h3 className="text-lg font-semibold truncate">{stamp.name}</h3>
        <p className="text-sm text-muted-foreground">
          Acquired on {format(new Date(stamp.purchase_date), "PPP")}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
         <Badge variant="outline" className="font-mono text-sm">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: stamp.currency }).format(stamp.valuation)}
        </Badge>
      </CardFooter>
    </Card>
  );
}
