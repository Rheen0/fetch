import { getCachedUserData } from "@/utils/supabase/cached-queries";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { NotificationsClient } from "@/components/notifications/notifications-client";

export default async function NotificationsPage() {
  const { user, profile, error } = await getCachedUserData();

  if (error || !user || !profile) {
    redirect("/login");
  }

  const supabase = await createClient();

  let notifications: any[] = [];
  let userType: "student" | "security" = "student";
  let userId: number;

  if (profile.user_type === "student") {
    if (!profile.studentId) {
      redirect("/student-record-missing");
    }
    userType = "student";
    userId = profile.studentId;

    // Fetch student notifications with match details
    const { data } = await supabase
      .from("notification")
      .select("notification_id, message, is_read, sent_at")
      .eq("student_id", userId)
      .order("sent_at", { ascending: false });

    notifications = data || [];
  } else if (profile.user_type === "security") {
    if (!profile.securityId) {
      redirect("/dashboard");
    }
    userType = "security";
    userId = profile.securityId;

    // Fetch security notifications
    const { data } = await supabase
      .from("securitynotifications")
      .select("notification_id, message, is_read")
      .eq("security_id", userId)
      .order("notification_id", { ascending: false });

    notifications = data || [];
  } else {
    redirect("/dashboard");
  }

  return (
    <NotificationsClient
      notifications={notifications}
      userType={userType}
      userId={userId}
      firstName={profile.first_name}
    />
  );
}
