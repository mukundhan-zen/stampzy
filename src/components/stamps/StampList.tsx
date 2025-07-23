import { StampListItem } from './StampListItem'

// Define a type for the stamp prop
type Stamp = {
  id: string;
  name: string;
  thumbnail_url: string | null;
  purchase_date: string | null;
  valuation: number | null;
  status: string;
};

interface StampListProps {
  stamps: Stamp[];
}

export function StampList({ stamps }: StampListProps) {
  if (stamps.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">You haven't added any stamps yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {stamps.map((stamp) => (
        <StampListItem key={stamp.id} stamp={stamp} />
      ))}
    </div>
  )
}
