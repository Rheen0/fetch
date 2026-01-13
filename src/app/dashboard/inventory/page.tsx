import { getCachedUserData } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { SecurityInventory } from "@/components/home/security/security-inventory";

export default async function InventoryPage() {
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
    <SecurityInventory
      securityId={profile.securityId || 0}
      firstName={profile.first_name}
      avatarUrl={profile.avatar_url}
    />
  );
}
