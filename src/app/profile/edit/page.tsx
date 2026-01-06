import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function EditProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link href="/profile" className="text-gray-900">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Edit Profile</h1>
        </div>
      </div>

      {/* Profile */}
      <div className="mx-auto max-w-md px-4 py-8">
        <ProfileForm profile={profile} email={user.email!} userId={user.id} />
      </div>
    </div>
  );
}
