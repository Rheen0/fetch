import { getCachedUserData } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { logout } from "../(auth)/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, LogOut, User } from "lucide-react";
import { StudentHome } from "@/components/home/student/student-home";
import { SecurityHome } from "@/components/home/security-home";
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
  searchParams: Promise<{ message?: string; success?: string; confirmed?: string }>;
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
        <nav className="border-b border-gray-200 bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-900">FETCH</h1>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                  {getUserTypeLabel(profile.user_type)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-gray-600 sm:block">
                  {profile.first_name} {profile.last_name}
                </span>
                {profile.user_type !== "admin" && (
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
                    title="View Profile"
                  >
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        className="h-10 w-10 rounded-full border-2 border-gray-300 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                  </Link>
                )}
                <form action={logout}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-md bg-fetch-red px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

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
            />
          )}
          {profile.user_type === "security" && (
            <SecurityHome
              securityId={profile.securityId || 0}
              firstName={profile.first_name}
              email={user.email || ""}
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
