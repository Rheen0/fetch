// filepath: src/app/profile/page.tsx
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  User,
  MessageCircle,
  Star,
  Settings,
  LogOut,
} from "lucide-react";
import { logout } from "../(auth)/actions";
import Image from "next/image";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Profile Info */}
      <div className="relative bg-fetch-red pb-9 pt-6 rounded-b-3xl shadow-md">
        <div className="mx-auto max-w-md px-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-lg font-medium">Profile</span>
          </Link>
        </div>

        {/* Profile Card */}
        <div className="mx-auto mt-8 max-w-md px-4">
          <div className="flex flex-col items-center">
            <div className="h-24 w-24 overflow-hidden rounded-full bg-white shadow-lg">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-12 w-12 text-gray-600" />
                </div>
              )}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="mt-1 text-sm text-red-100">{user.email}</p>
            {/* User Type Badge */}
            <div className="mx-auto max-w-md px-4 text-center pb-8">
              <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800">
                {profile.user_type === "student"
                  ? "Student"
                  : profile.user_type === "security"
                  ? "Security Personnel"
                  : "Administrator"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="mx-auto mt-10 max-w-md px-4 pb-8 space-y-4">
        {/* Edit Profile */}
        <Link
          href="/profile/edit"
          className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-medium text-gray-900">Edit Profile</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>

        {/* Customer Support */}
        <Link
          href="/profile/support"
          className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <MessageCircle className="h-5 w-5 text-green-600" />
            </div>
            <span className="font-medium text-gray-900">Customer Support</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>

        {/* Rate Us */}
        <Link
          href="/profile/rate"
          className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50">
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <span className="font-medium text-gray-900">Rate Us</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>

        {/* Settings */}
        <Link
          href="/profile/settings"
          className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50">
              <Settings className="h-5 w-5 text-gray-600" />
            </div>
            <span className="font-medium text-gray-900">Settings</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Link>

        {/* Log Out */}
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center justify-between rounded-lg bg-white p-4 shadow-sm text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <LogOut className="h-5 w-5 text-fetch-red" />
              </div>
              <span className="font-medium text-fetch-red">Log out</span>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </button>
        </form>
      </div>
    </div>
  );
}
