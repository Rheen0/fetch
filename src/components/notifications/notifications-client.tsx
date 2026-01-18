"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCheck, Bell } from "lucide-react";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/app/dashboard/notifications/actions";
import { toast } from "sonner";

interface NotificationsClientProps {
  notifications: any[];
  userType: "student" | "security";
  userId: number;
  firstName: string;
}

export function NotificationsClient({
  notifications: initialNotifications,
  userType,
  userId,
  firstName,
}: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (notificationId: number) => {
    const result = await markNotificationAsRead(notificationId, userType);
    if (result.success) {
      setNotifications(
        notifications.map((n) =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead(userId, userType);
    if (result.success) {
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      toast.success("All notifications marked as read");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {unreadCount} unread
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-fetch-red border-fetch-red hover:bg-fetch-red hover:text-white"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => {
              return (
                <Card
                  key={notification.notification_id}
                  className={`${
                    notification.is_read
                      ? "bg-white"
                      : "bg-blue-50 border-blue-200"
                  } hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-lg bg-fetch-red/10 flex items-center justify-center">
                          <Bell className="w-6 h-6 text-fetch-red" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.message}
                          </p>
                          {!notification.is_read && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-500 text-white text-xs shrink-0"
                            >
                              New
                            </Badge>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDate(notification.sent_at)}
                          </span>

                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleMarkAsRead(notification.notification_id)
                              }
                              className="text-xs h-7 text-fetch-red hover:text-fetch-red hover:bg-fetch-red/10"
                            >
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-gray-100 p-4 mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-sm">
                {userType === "student"
                  ? "We'll notify you when we find matches for your lost items"
                  : "You'll see notifications when students claim your found items"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
