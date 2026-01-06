import { getCachedUser, getCachedProfile } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const { user, error: userError } = await getCachedUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Check if profile exists and is completed
  const { profile, error: profileError } = await getCachedProfile(user.id);

  if (!profileError && profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-gray-600">
            We need a bit more information to set up your account
          </p>
        </div>
        <OnboardingForm userId={user.id} email={user.email!} />
      </div>
    </div>
  );
}
