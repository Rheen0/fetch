"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function markNotificationAsRead(
  notificationId: number,
  userType: "student" | "security"
) {
  const supabase = await createClient();

  try {
    const tableName =
      userType === "student" ? "notification" : "securitynotifications";

    const { error } = await supabase
      .from(tableName)
      .update({ is_read: true })
      .eq("notification_id", notificationId);

    if (error) throw error;

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return { error: error.message };
  }
}

export async function markAllNotificationsAsRead(
  userId: number,
  userType: "student" | "security"
) {
  const supabase = await createClient();

  try {
    const tableName =
      userType === "student" ? "notification" : "securitynotifications";
    const idColumn = userType === "student" ? "student_id" : "security_id";

    const { error } = await supabase
      .from(tableName)
      .update({ is_read: true })
      .eq(idColumn, userId)
      .eq("is_read", false);

    if (error) throw error;

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    return { error: error.message };
  }
}
