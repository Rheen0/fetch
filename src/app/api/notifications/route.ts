import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const userType = searchParams.get("userType");
  const limit = parseInt(searchParams.get("limit") || "5");

  if (!userId || !userType) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    let notifications: any[] = [];
    let unreadCount = 0;

    if (userType === "student") {
      // Fetch student notifications
      const { data, error } = await supabase
        .from("notification")
        .select("notification_id, message, is_read, sent_at")
        .eq("student_id", parseInt(userId))
        .order("sent_at", { ascending: false })
        .limit(limit);

      console.log("Student notifications query result:", { data, error, userId });

      notifications = data || [];

      // Get unread count
      const { count } = await supabase
        .from("notification")
        .select("notification_id", { count: "exact", head: true })
        .eq("student_id", parseInt(userId))
        .eq("is_read", false);

      unreadCount = count || 0;
    } else if (userType === "security") {
      // Fetch security notifications
      const { data } = await supabase
        .from("securitynotifications")
        .select("notification_id, message, is_read")
        .eq("security_id", parseInt(userId))
        .order("notification_id", { ascending: false })
        .limit(limit);

      notifications = data || [];

      // Get unread count
      const { count } = await supabase
        .from("securitynotifications")
        .select("notification_id", { count: "exact", head: true })
        .eq("security_id", parseInt(userId))
        .eq("is_read", false);

      unreadCount = count || 0;
    }

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
