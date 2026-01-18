"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { markNotificationAsRead } from "@/app/dashboard/notifications/actions";

interface NotificationDropdownProps {
  userId: number;
  userType: "student" | "security";
  initialUnreadCount?: number;
}

export function NotificationDropdown({
  userId,
  userType,
  initialUnreadCount = 0,
}: NotificationDropdownProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch unread count immediately on mount
  useEffect(() => {
    fetchUnreadCount();
  }, [userId, userType]);

  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(
        `/api/notifications?userId=${userId}&userType=${userType}&limit=0`
      );
      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/notifications?userId=${userId}&userType=${userType}&limit=5`
      );
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    await markNotificationAsRead(notificationId, userType);
    setNotifications(
      notifications.map((n) =>
        n.notification_id === notificationId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCount(Math.max(0, unreadCount - 1));
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
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2">
          <Bell className="w-6 h-6 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-fetch-red text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <p className="text-xs text-gray-500">{unreadCount} unread</p>
          </div>
          <Link href="/dashboard/notifications">
            <Button variant="ghost" size="sm" className="text-xs h-7">
              View all
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>

        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fetch-red"></div>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.is_read ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => {
                      if (!notification.is_read) {
                        handleMarkAsRead(notification.notification_id);
                      }
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-fetch-red/10 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-5 h-5 text-fetch-red" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm text-gray-900 line-clamp-2">
                            {notification.message || "No message"}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1"></div>
                          )}
                        </div>

                        <p className="text-xs text-gray-500">
                          {formatDate(notification.sent_at)}
                        </p>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="rounded-full bg-gray-100 p-3 mb-3">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 text-center">
                No notifications yet
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
