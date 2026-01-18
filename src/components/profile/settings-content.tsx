"use client";

import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Shield,
  Moon,
  Globe,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SettingsContentProps {
  profile: {
    id: string;
    first_name: string;
    user_type: string;
  };
}

export function SettingsContent({ profile }: SettingsContentProps) {
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleToggle = (setting: string, value: boolean) => {
    toast.success("Settings updated", {
      description: `${setting} ${value ? "enabled" : "disabled"}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link href="/profile" className="text-gray-900">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-6 space-y-6">
        {/* Account Info */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-sm text-blue-800">
            Logged in as{" "}
            <span className="font-medium">{profile.first_name}</span> (
            {profile.user_type === "student" ? "Student" : "Security Personnel"}
            )
          </AlertDescription>
        </Alert>

        {/* Notifications */}
        {/* <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 px-1">
            Notifications
          </h3>

          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-gray-900">Push Notifications</p>
                  <p className="text-xs text-gray-500">Receive match alerts</p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => {
                    setNotifications(e.target.checked);
                    handleToggle("Push notifications", e.target.checked);
                  }}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-gray-900">Email Alerts</p>
                  <p className="text-xs text-gray-500">Get updates via email</p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => {
                    setEmailAlerts(e.target.checked);
                    handleToggle("Email alerts", e.target.checked);
                  }}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        </div> */}

        {/* Other */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 px-1">Other</h3>

          <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
            <Link
              href="#"
              className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-gray-50 first:rounded-t-lg"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-gray-900">Language</p>
                  <p className="text-xs text-gray-500">English (US)</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              href="#"
              className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <p className="text-gray-900">Privacy & Security</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>

            <Link
              href="/profile/support"
              className="flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-gray-50 last:rounded-b-lg"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="h-5 w-5 text-gray-600" />
                <p className="text-gray-900">Help & Support</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* App Version */}
        <div className="text-center text-xs text-gray-500">FETCH v1.0.0</div>
      </div>
    </div>
  );
}
