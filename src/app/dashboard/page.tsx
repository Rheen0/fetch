"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { logout } from "../(auth)/actions";
import { useEffect, useState, Suspense } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, LogOut, User } from "lucide-react";
import { StudentHome } from "@/components/home/student-home";
import { SecurityHome } from "@/components/home/security-home";
import { AdminHome } from "@/components/home/admin-home";
import Link from "next/link";

interface UserProfile {
  id: string;
  email: string;
  userType: "student" | "security" | "admin";
  firstName?: string;
  lastName?: string;
  phone?: string;
  studentNumber?: string;
  employeeId?: string;
  department?: string;
  onboardingCompleted: boolean;
  studentId?: number;
  securityId?: number;
  avatarUrl?: string | null;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const message = searchParams.get("message");
  const success = searchParams.get("success");
  const confirmed = searchParams.get("confirmed");

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/login");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, avatar_url")
        .eq("id", authUser.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile error:", profileError);
        router.push("/onboarding");
        return;
      }

      if (!profile.onboarding_completed) {
        router.push("/onboarding");
        return;
      }

      const userProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || "",
        userType: profile.user_type,
        firstName: profile.first_name,
        lastName: profile.last_name,
        phone: profile.phone,
        studentNumber: profile.student_number,
        employeeId: profile.employee_id,
        department: profile.department,
        onboardingCompleted: profile.onboarding_completed,
        avatarUrl: profile.avatar_url,
      };

      if (profile.user_type === "student") {
        const { data: student } = await supabase
          .from("student")
          .select("student_id")
          .eq("email", authUser.email)
          .single();
        userProfile.studentId = student?.student_id;
      } else if (profile.user_type === "security") {
        const { data: security } = await supabase
          .from("securitypersonnel")
          .select("security_id")
          .eq("email", authUser.email)
          .single();
        userProfile.securityId = security?.security_id;
      }

      setUser(userProfile);
      setLoading(false);
    };

    checkUser();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (success) {
      toast.success("Welcome back!", {
        description: "You have successfully signed in.",
        duration: 4000,
      });
    }
    if (confirmed && message) {
      toast.success("Email Confirmed!", {
        description: message,
        duration: 5000,
      });
    }
  }, [success, confirmed, message]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-900">FETCH</h1>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                {getUserTypeLabel(user.userType)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-sm text-gray-600 sm:block">
                {user.firstName} {user.lastName}
              </span>
              {user.userType !== "admin" && (
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
                  title="View Profile"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user.firstName} ${user.lastName}`}
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
                  className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
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

        {user.userType === "student" && (
          <StudentHome
            studentId={user.studentId || 0}
            firstName={user.firstName}
            email={user.email}
          />
        )}
        {user.userType === "security" && (
          <SecurityHome
            securityId={user.securityId || 0}
            firstName={user.firstName}
            email={user.email}
          />
        )}
        {user.userType === "admin" && (
          <AdminHome firstName={user.firstName} email={user.email} />
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
