import { getCachedUserData } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { CustomerSupportContent } from "@/components/profile/customer-support-content";

export default async function CustomerSupportPage() {
  const { user, profile, error } = await getCachedUserData();

  if (error || !user || !profile) {
    redirect("/login");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return <CustomerSupportContent profile={profile} />;
}
