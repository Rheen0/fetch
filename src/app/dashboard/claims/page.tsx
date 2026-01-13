import { getCachedUserData } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { SecurityClaims } from "@/components/home/security/security-claims";

export default async function ClaimsPage() {
  const { user, profile, error } = await getCachedUserData();

  if (error || !user || !profile) {
    redirect("/login");
  }

  if (!profile.onboarding_completed || !profile.user_type) {
    redirect("/onboarding");
  }

  if (profile.user_type !== "security") {
    redirect("/dashboard");
  }

  return (
    <SecurityClaims
      securityId={profile.securityId || 0}
      firstName={profile.first_name}
      avatarUrl={profile.avatar_url}
    />
  );
}
