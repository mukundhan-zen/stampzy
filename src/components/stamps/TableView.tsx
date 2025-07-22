"use client";

import { format } from "date-fns";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Stamp {
  id: string;
  name: string;
  purchase_date: Date;
  purchase_price: number;
  seller: string;
  currency: string;
  valuation: number;
  is_sold: boolean;
}

interface TableViewProps {
  stamps: Stamp[];
}

export function TableView({ stamps }: TableViewProps) {
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Purchase Date</TableHead>
              <TableHead className="hidden md:table-cell">Purchase Price</TableHead>
              <TableHead className="text-right">Valuation</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stamps.map((stamp) => (
              <TableRow key={stamp.id}>
                <TableCell>
                    <Badge variant={stamp.is_sold ? "destructive" : "outline"}>
                        {stamp.is_sold ? "Sold" : "In Collection"}
                    </Badge>
                </TableCell>
                <TableCell className="font-medium truncate max-w-xs">{stamp.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {format(new Date(stamp.purchase_date), "PPP")}
                </TableCell>
                <TableCell className="hidden md:table-cell font-mono">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: stamp.currency }).format(stamp.purchase_price)}
                </TableCell>
                <TableCell className="text-right font-mono">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: stamp.currency }).format(stamp.valuation)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       {stamps.length === 0 && (
        <div className="text-center p-8 text-muted-foreground">
          No stamps in your collection yet.
        </div>
      )}
    </div>
  );
}
