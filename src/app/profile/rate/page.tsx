import { getCachedUserData } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { RateUsContent } from "@/components/profile/rate-us-content";

export default async function RateUsPage() {
  const { user, profile, error } = await getCachedUserData();

  if (error || !user || !profile) {
    redirect("/login");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  return <RateUsContent profile={profile} email={user.email!} />;
}
