"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ReportFoundModal } from "@/components/modals/report-found-modal";
import { SecurityLayout } from "@/components/layouts/security-layout";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { Card, CardContent } from "@/components/ui/card";
import { StatsSkeleton } from "@/components/skeletons/stats-skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, User, Bell } from "lucide-react";

interface SecurityHomeProps {
  securityId: number;
  firstName: string;
  email: string;
  avatarUrl?: string | null;
}

interface SecurityStats {
  foundItems: number;
  claimRequests: number;
  itemReturned: number;
}

interface RecentFoundItem {
  found_id: number;
  item_name: string;
  category: string;
  image_url: string | null;
  found_location: string | null;
  found_at: string;
  status: string;
}

export function SecurityHome({
  securityId,
  firstName,
  email,
  avatarUrl,
}: SecurityHomeProps) {
  const [stats, setStats] = useState<SecurityStats>({
    foundItems: 0,
    claimRequests: 0,
    itemReturned: 0,
  });
  const [recentItems, setRecentItems] = useState<RecentFoundItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [securityId]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      // Fetch unread notifications count
      const { count: notifCount } = await supabase
        .from("securitynotifications")
        .select("notification_id", { count: "exact", head: true })
        .eq("security_id", securityId)
        .eq("is_read", false);

      setUnreadNotifications(notifCount || 0);

      // Fetch stats
      const [foundItems, claimRequests, itemReturned] = await Promise.all([
        supabase
          .from("founditem")
          .select("found_id", { count: "exact", head: true })
          .eq("security_id", securityId),

        supabase
          .from("claim")
          .select("claim_id", { count: "exact", head: true })
          .eq("status", "pending"),

        supabase
          .from("founditem")
          .select("found_id", { count: "exact", head: true })
          .eq("security_id", securityId)
          .eq("status", "claimed"),
      ]);

      setStats({
        foundItems: foundItems.count || 0,
        claimRequests: claimRequests.count || 0,
        itemReturned: itemReturned.count || 0,
      });

      // Fetch recent found items
      const { data: items } = await supabase
        .from("founditem")
        .select("*")
        .eq("security_id", securityId)
        .order("found_at", { ascending: false })
        .limit(10);

      setRecentItems(items || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = searchQuery
    ? recentItems.filter(
        (item) =>
          item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentItems;

  return (
    <SecurityLayout
      securityId={securityId}
      currentPath="dashboard"
    >
      {/* Main Content */}
      <div className="p-4 pb-24">
        {/* Header with Avatar and Notification */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/profile" className="flex items-center gap-2">
            {avatarUrl ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                <Image
                  src={avatarUrl}
                  alt={firstName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </Link>

          <NotificationDropdown
            userId={securityId}
            userType="security"
            initialUnreadCount={unreadNotifications}
          />
        </div>

        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {firstName}!
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Let's help fetch lost item.
          </p>
        </div>

        {/* Stats Card */}
        <div>
          {loading ? (
            <StatsSkeleton />
          ) : (
            <Card className="bg-fetch-red text-white border-0 mb-6 overflow-hidden">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">
                      {stats.foundItems}
                    </div>
                    <div className="text-xs opacity-90">Found Items</div>
                  </div>
                  <div className="text-center border-x border-white/20">
                    <div className="text-3xl font-bold mb-1">
                      {stats.claimRequests}
                    </div>
                    <div className="text-xs opacity-90">Claim Requests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">
                      {stats.itemReturned}
                    </div>
                    <div className="text-xs opacity-90">Item Returned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        {/* Browse Found Items Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Browse Found Items
              </h2>
              <p className="text-sm text-gray-500 mt-1">Items you've logged</p>
            </div>
            <Link href="/dashboard/inventory">
              <Button
                variant="ghost"
                size="sm"
                className="text-fetch-red hover:text-fetch-red hover:bg-fetch-red/10"
              >
                View All
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search your found items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-gray-200 focus:border-fetch-red focus:ring-fetch-red"
            />
          </div>

          {/* Items Display - Grid or Marquee */}
          {loading ? (
            <div className="flex flex-wrap gap-4 justify-center">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="w-[280px] overflow-hidden">
                  <div className="w-full h-[200px] bg-gray-200 animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="relative">
              {filteredItems.length < 4 ? (
                // Static grid for 1-3 items
                <div className="flex flex-wrap gap-4 justify-center">
                  {filteredItems.map((item) => (
                    <div
                      key={item.found_id}
                      className="flex justify-center w-full sm:w-auto"
                    >
                      <FoundItemCard item={item} />
                    </div>
                  ))}
                </div>
              ) : (
                // Marquee for 4+ items
                <Marquee pauseOnHover className="[--duration:60s]">
                  {filteredItems.map((item) => (
                    <FoundItemCard key={item.found_id} item={item} />
                  ))}
                </Marquee>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {searchQuery
                ? "No items found for your search"
                : "No items logged yet. Start by logging found items!"}
            </div>
          )}
        </div>
      </div>

      {/* Report Found Modal */}
      {isModalOpen && (
        <ReportFoundModal
          securityId={securityId}          onClose={() => setIsModalOpen(false)}          onSuccess={() => {
            setIsModalOpen(false);
            fetchDashboardData();
          }}
        />
      )}
    </SecurityLayout>
  );
}

interface FoundItemCardProps {
  item: RecentFoundItem;
}

function FoundItemCard({ item }: FoundItemCardProps) {
  const foundDate = new Date(item.found_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const statusConfig = {
    pending: {
      label: "Pending",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    returned: {
      label: "Returned",
      color: "bg-green-50 text-green-700 border-green-200",
    },
  };

  const status =
    statusConfig[item.status as keyof typeof statusConfig] ||
    statusConfig.pending;

  return (
    <Card className="w-[280px] shrink-0 overflow-hidden border-gray-200 hover:border-fetch-red transition-all hover:shadow-md">
      <CardContent className="p-0">
        {item.image_url ? (
          <div className="relative w-full h-[200px] bg-gray-100">
            <Image
              src={item.image_url}
              alt={item.item_name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-2 right-2">
              <span
                className={`${status.color} text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-sm`}
              >
                {status.label}
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full h-[200px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <span className="text-gray-500 text-xs">No Image</span>
            </div>
            <div className="absolute bottom-2 right-2">
              <span
                className={`${status.color} text-xs font-bold px-3 py-1 rounded-full border`}
              >
                {status.label}
              </span>
            </div>
          </div>
        )}

        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                {item.category}
              </span>
            </div>
            <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
              {item.item_name}
            </h3>
          </div>

          <div className="space-y-1.5 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-fetch-red mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="line-clamp-1">
                {item.found_location || "Unknown location"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Found on {foundDate}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
