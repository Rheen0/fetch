import { getCachedUserData } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { logout } from "../(auth)/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, LogOut, User } from "lucide-react";
import { StudentHome } from "@/components/home/student/student-home";
import { SecurityHome } from "@/components/home/security/security-home";
import { AdminHome } from "@/components/home/admin-home";
import Link from "next/link";
import { ToastHandler } from "./toast-handler";

const getUserTypeLabel = (type: string) => {
  switch (type) {
    case "student":
      return "Student";
    case "security":
      return "Security Personnel";
    case "admin":
      return "Administrator";
    default:
      return type;
  }
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    message?: string;
    success?: string;
    confirmed?: string;
  }>;
}) {
  const { user, profile, error } = await getCachedUserData();

  if (error || !user || !profile) {
    redirect("/login");
  }

  if (!profile.onboarding_completed) {
    redirect("/onboarding");
  }

  const params = await searchParams;
  const message = params.message;
  const success = params.success;
  const confirmed = params.confirmed;

  return (
    <>
      <ToastHandler success={success} confirmed={confirmed} message={message} />
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {message && (
            <Alert className="mb-6 border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">
                {message}
              </AlertDescription>
            </Alert>
          )}

          {profile.user_type === "student" && (
            <StudentHome
              studentId={profile.studentId || 0}
              firstName={profile.first_name}
              email={user.email || ""}
              avatarUrl={profile.avatar_url}
            />
          )}
          {profile.user_type === "security" && (
            <SecurityHome
              securityId={profile.securityId || 0}
              firstName={profile.first_name}
              email={user.email || ""}
              avatarUrl={profile.avatar_url}
            />
          )}
          {profile.user_type === "admin" && (
            <AdminHome
              firstName={profile.first_name}
              email={user.email || ""}
            />
          )}
        </main>
      </div>
    </>
  );
}
