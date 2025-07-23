import { StampForm } from "@/components/stamps/StampForm";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AddStampPage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add a New Stamp</h1>
        <StampForm />
      </div>
    </div>
  );
}
