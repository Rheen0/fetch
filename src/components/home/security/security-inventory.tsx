"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { SecurityLayout } from "@/components/layouts/security-layout";
import { EditFoundModal } from "@/components/modals/edit-found-modal";
import { NotificationDropdown } from "@/components/notifications/notification-dropdown";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, User, Bell, ArrowLeft, Filter, Calendar, MapPin, CheckCircle2, Pencil, Trash } from "lucide-react";
import { SearchFilters, type SearchFilters as SearchFiltersType } from "@/components/search/search-filters";
import { filterFoundItems, sortByRelevance } from "@/lib/search-utils";
import { deleteFoundItem } from "@/app/dashboard/inventory/actions";
import type { FoundItem } from "@/lib/types";

interface SecurityInventoryProps {
  securityId: number;
  firstName: string;
  avatarUrl?: string | null;
}

export function SecurityInventory({
  securityId,
  firstName,
  avatarUrl,
}: SecurityInventoryProps) {
  const [items, setItems] = useState<FoundItem[]>([]);
  const [editingItem, setEditingItem] = useState<FoundItem | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFiltersType>({
    searchQuery: "",
    category: "",
    location: "",
    dateFrom: "",
    dateTo: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    foundId: number | null;
  }>({ open: false, foundId: null });

  // Filter and sort items based on search criteria
  const filteredItems = useMemo(() => {
    let filtered = filterFoundItems(items, searchFilters);
    if (searchFilters.searchQuery) {
      filtered = sortByRelevance(filtered, searchFilters.searchQuery);
    }
    return filtered;
  }, [items, searchFilters]);

  const pendingItems = filteredItems.filter((item) => item.status === "pending");
  const claimedItems = filteredItems.filter((item) => item.status === "claimed");
  const returnedItems = filteredItems.filter((item) => item.status === "returned");

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

  const handleDeleteItem = async () => {
    if (!deleteDialog.foundId) return;

    const result = await deleteFoundItem(deleteDialog.foundId);

    if (result.success) {
      toast.success("Item deleted successfully");
      fetchItems();
    } else {
      toast.error(result.error || "Failed to delete item");
    }

    setDeleteDialog({ open: false, foundId: null });
  };

  const stats = {
    all: items.length,
    pending: items.filter((i) => i.status === "pending").length,
    claimed: items.filter((i) => i.status === "claimed").length,
    returned: items.filter((i) => i.status === "returned").length,
  };

  // Get filtered items based on active tab
  const displayedItems = useMemo(() => {
    if (activeTab === "all") return filteredItems;
    if (activeTab === "pending") return pendingItems;
    if (activeTab === "claimed") return claimedItems;
    if (activeTab === "returned") return returnedItems;
    return filteredItems;
  }, [activeTab, filteredItems, pendingItems, claimedItems, returnedItems]);

  return (
    <SecurityLayout currentPath="inventory">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-fetch-red" />
                  Found Items Inventory
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {stats.all} total items
                </p>
              </div>
            </div>
            <NotificationDropdown
              userId={securityId}
              userType="security"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-xs text-gray-500 mt-1">Pending Items</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{stats.claimed}</p>
            <p className="text-xs text-gray-500 mt-1">Claimed Items</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{stats.returned}</p>
            <p className="text-xs text-gray-500 mt-1">Returned Items</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-2xl font-bold text-gray-900">{stats.all}</p>
            <p className="text-xs text-gray-500 mt-1">Total Items</p>
          </div>
        </div>

        {/* Search Filters */}
        <SearchFilters
          onFilterChange={setSearchFilters}
          showStatus={true}
          userType="security"
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 bg-gray-100 rounded-lg p-1">
            <TabsTrigger 
              value="all"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-fetch-red data-[state=active]:shadow-sm"
            >
              All ({filteredItems.length})
            </TabsTrigger>
            <TabsTrigger 
              value="pending"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              Pending ({pendingItems.length})
            </TabsTrigger>
            <TabsTrigger 
              value="claimed"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              Claimed ({claimedItems.length})
            </TabsTrigger>
            <TabsTrigger 
              value="returned"
              className="rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
            >
              Returned ({returnedItems.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="h-24 bg-gray-200 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayedItems.length > 0 ? (
              displayedItems.map((item) => (
                <FoundItemCard 
                  key={item.found_id} 
                  item={item}
                  onEdit={() => setEditingItem(item)}
                  onDelete={() => setDeleteDialog({ open: true, foundId: item.found_id })}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No items found
                </h3>
                <p className="text-sm text-gray-500">
                  {searchFilters.searchQuery || Object.values(searchFilters).some(v => v)
                    ? "Try adjusting your search filters"
                    : "No items in this category"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="h-24 bg-gray-200 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : pendingItems.length > 0 ? (
              pendingItems.map((item) => (
                <FoundItemCard key={item.found_id} item={item} />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No pending items
                </h3>
                <p className="text-sm text-gray-500">
                  Pending items will appear here
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="claimed" className="space-y-4 mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="h-24 bg-gray-200 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : claimedItems.length > 0 ? (
              claimedItems.map((item) => (
                <FoundItemCard key={item.found_id} item={item} />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No claimed items
                </h3>
                <p className="text-sm text-gray-500">
                  Claimed items will appear here
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="returned" className="space-y-4 mt-6">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="h-24 bg-gray-200 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : returnedItems.length > 0 ? (
              returnedItems.map((item) => (
                <FoundItemCard key={item.found_id} item={item} />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No returned items
                </h3>
                <p className="text-sm text-gray-500">
                  Returned items will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog({ open, foundId: deleteDialog.foundId })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Found Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this item and all associated claims and matches. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-fetch-red hover:bg-fetch-red/90"
            >
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Found Modal */}
      {editingItem && (
        <EditFoundModal
          item={editingItem}
          securityId={securityId}
          onClose={() => setEditingItem(null)}
          onSuccess={fetchItems}
        />
      )}
    </SecurityLayout>
  );
}

interface FoundItemCardProps {
  item: FoundItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

function FoundItemCard({ item, onEdit, onDelete }: FoundItemCardProps) {
  const foundDate = new Date(item.found_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const statusConfig = {
    pending: { 
      label: "Pending", 
      color: "bg-yellow-100 text-yellow-700",
      icon: CheckCircle2
    },
    claimed: { 
      label: "Claimed", 
      color: "bg-blue-100 text-blue-700",
      icon: CheckCircle2
    },
    returned: { 
      label: "Returned", 
      color: "bg-green-100 text-green-700",
      icon: CheckCircle2
    },
  };

  const status =
    statusConfig[item.status as keyof typeof statusConfig] ||
    statusConfig.pending;

  const StatusIcon = status.icon;

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Image */}
          <div className="shrink-0">
            {item.image_url ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={item.image_url}
                  alt={item.item_name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {item.item_name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs capitalize">
                    {item.category}
                  </Badge>
                  <Badge className={`${status.color} hover:${status.color}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                </div>
              </div>
            </div>

            {item.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.description}
              </p>
            )}

            <div className="space-y-1 text-sm text-gray-600 mb-3">
              {item.found_location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>Found at: {item.found_location}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Found: {foundDate}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}
                className="text-gray-600"
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
              {item.status === "returned" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDelete}
                  className="text-fetch-red border-fetch-red hover:bg-fetch-red/10"
                >
                  <Trash className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
