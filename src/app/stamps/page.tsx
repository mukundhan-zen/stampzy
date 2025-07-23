import Link from "next/link"
import { getStamps } from "@/app/stamps/actions"
import { Button } from "@/components/ui/button"
import { StampList } from "@/components/stamps/StampList"

export default async function StampsPage() {
  const { success, data, message } = await getStamps()

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Collection</h1>
        <Button asChild>
          <Link href="/stamps/add">Add Stamp</Link>
        </Button>
      </div>
      
      {success ? (
        <StampList stamps={data} />
      ) : (
        <div className="text-center py-10">
          <p className="text-destructive">Error: {message}</p>
        </div>
      )}
    </div>
  )
}
