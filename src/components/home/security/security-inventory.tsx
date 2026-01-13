"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { SecurityLayout } from "@/components/layouts/security-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, User, Bell, ArrowLeft, Filter } from "lucide-react";

interface SecurityInventoryProps {
  securityId: number;
  firstName: string;
  avatarUrl?: string | null;
}

interface FoundItem {
  found_id: number;
  item_name: string;
  category: string;
  image_url: string | null;
  found_location: string | null;
  found_at: string;
  status: string;
  description: string | null;
}

export function SecurityInventory({
  securityId,
  firstName,
  avatarUrl,
}: SecurityInventoryProps) {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchItems();
  }, [securityId]);

  const fetchItems = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("founditem")
        .select("*")
        .eq("security_id", securityId)
        .order("found_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "available" && item.status === "available") ||
      (activeTab === "returned" && item.status === "claimed") ||
      (activeTab === "pending" && item.status === "pending");

    return matchesSearch && matchesTab;
  });

  const stats = {
    all: items.length,
    available: items.filter((i) => i.status === "available").length,
    returned: items.filter((i) => i.status === "claimed").length,
    pending: items.filter((i) => i.status === "pending").length,
  };

  return (
    <SecurityLayout currentPath="inventory">
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Found Items</h1>
          </div>

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
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 rounded-lg border-gray-300 bg-white"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
            <TabsTrigger value="available">
              Available ({stats.available})
            </TabsTrigger>
            <TabsTrigger value="returned">
              Returned ({stats.returned})
            </TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-square bg-gray-200 animate-pulse" />
                <CardContent className="p-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <FoundItemCard key={item.found_id} item={item} />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-gray-100 p-4 mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                No items found
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-sm">
                {searchQuery
                  ? "Try adjusting your search"
                  : "No items in this category"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </SecurityLayout>
  );
}

interface FoundItemCardProps {
  item: FoundItem;
}

function FoundItemCard({ item }: FoundItemCardProps) {
  const foundDate = new Date(item.found_at).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });

  const statusConfig = {
    available: { label: "Available", color: "bg-green-100 text-green-700" },
    claimed: { label: "Returned", color: "bg-gray-100 text-gray-700" },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  };

  const status =
    statusConfig[item.status as keyof typeof statusConfig] ||
    statusConfig.available;

  return (
    <Link href={`/dashboard/inventory/${item.found_id}`}>
      <Card className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
        {item.image_url ? (
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={item.image_url}
              alt={item.item_name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
        )}

        <CardContent className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
            {item.item_name}
          </h3>
          <p className="text-xs text-gray-500 mb-2 capitalize">
            {item.category}
          </p>
          <p className="text-xs text-gray-400 mb-2">
            Reported date: {foundDate}
          </p>
          <Badge
            variant="secondary"
            className={`text-xs px-2 py-0.5 ${status.color}`}
          >
            {status.label}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
