import { getStampById } from "@/app/stamps/actions";
import { StampForm } from "@/components/stamps/StampForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface EditStampPageProps {
  params: {
    id: string;
  };
}

export default async function EditStampPage({ params }: EditStampPageProps) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  const { success, data: stamp, message } = await getStampById(params.id);

  if (!success || !stamp) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="text-center py-10">
          <p className="text-destructive">Error: {message || "Stamp not found."}</p>
        </div>
      </div>
    );
  }

  // Convert date string to Date object for the form
  const initialData = {
    ...stamp,
    purchase_date: stamp.purchase_date ? new Date(stamp.purchase_date) : undefined,
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Stamp</h1>
        <StampForm initialData={initialData} />
      </div>
    </div>
  );
}
