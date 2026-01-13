"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { updateClaimStatus } from "@/app/dashboard/claims/actions";
import { SecurityLayout } from "@/components/layouts/security-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Package,
  User,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

interface SecurityClaimsProps {
  securityId: number;
  firstName: string;
  avatarUrl?: string | null;
}

interface Claim {
  claim_id: number;
  found_id: number;
  student_id: number;
  status: string;
  claim_at: string;
  founditem: {
    item_name: string;
    category: string;
    image_url: string | null;
    found_location: string | null;
  };
  student: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function SecurityClaims({
  securityId,
  firstName,
  avatarUrl,
}: SecurityClaimsProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState<{
    claim: Claim;
    action: "approve" | "deny";
  } | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, [securityId]);

  const fetchClaims = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("claim")
        .select(
          `
          *,
          founditem:found_id (
            item_name,
            category,
            image_url,
            found_location
          ),
          student:student_id (
            first_name,
            last_name,
            email
          )
        `
        )
        .order("claim_at", { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error("Error fetching claims:", error);
      toast.error("Failed to load claims");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClaim = async () => {
    if (!selectedClaim) return;

    setProcessing(true);

    try {
      const result = await updateClaimStatus(
        selectedClaim.claim.claim_id,
        selectedClaim.action === "approve" ? "approved" : "rejected",
        selectedClaim.claim.found_id
      );

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          selectedClaim.action === "approve"
            ? "Claim approved successfully!"
            : "Claim denied"
        );
        fetchClaims();
      }
    } catch (error) {
      toast.error("Failed to update claim");
    } finally {
      setProcessing(false);
      setSelectedClaim(null);
    }
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.founditem.item_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      claim.student.first_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      claim.student.last_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "pending" && claim.status === "pending") ||
      (activeTab === "approved" && claim.status === "approved") ||
      (activeTab === "rejected" && claim.status === "rejected");

    return matchesSearch && matchesTab;
  });

  const stats = {
    all: claims.length,
    pending: claims.filter((c) => c.status === "pending").length,
    approved: claims.filter((c) => c.status === "approved").length,
    rejected: claims.filter((c) => c.status === "rejected").length,
  };

  return (
    <SecurityLayout currentPath="claims">
      <div className="p-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Claims</h1>
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
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({stats.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({stats.rejected})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Claims List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="h-20 bg-gray-200 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredClaims.length > 0 ? (
          <div className="space-y-3">
            {filteredClaims.map((claim) => (
              <ClaimCard
                key={claim.claim_id}
                claim={claim}
                onVerify={(action) => setSelectedClaim({ claim, action })}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-gray-100 p-4 mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                No claims found
              </h3>
              <p className="text-sm text-gray-600 text-center max-w-sm">
                {searchQuery
                  ? "Try adjusting your search"
                  : "No claims in this category"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      {selectedClaim && (
        <AlertDialog
          open={!!selectedClaim}
          onOpenChange={() => !processing && setSelectedClaim(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="mx-auto mb-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    selectedClaim.action === "approve"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {selectedClaim.action === "approve" ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600" />
                  )}
                </div>
              </div>
              <AlertDialogTitle className="text-center">
                {selectedClaim.action === "approve"
                  ? "Item Approved"
                  : "Item Denied"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                {selectedClaim.action === "approve"
                  ? "Thanks for verifying the item!"
                  : "Are you sure you want to deny this claim?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-col gap-2">
              {selectedClaim.action === "deny" && (
                <AlertDialogCancel className="w-full m-0" disabled={processing}>
                  No
                </AlertDialogCancel>
              )}
              <AlertDialogAction
                onClick={handleVerifyClaim}
                disabled={processing}
                className="w-full m-0 bg-fetch-red hover:bg-fetch-red/90"
              >
                {processing
                  ? "Processing..."
                  : selectedClaim.action === "approve"
                  ? "Ok"
                  : "Yes"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </SecurityLayout>
  );
}

interface ClaimCardProps {
  claim: Claim;
  onVerify: (action: "approve" | "deny") => void;
}

function ClaimCard({ claim, onVerify }: ClaimCardProps) {
  const statusConfig = {
    pending: { label: "Verify", color: "text-fetch-red" },
    approved: { label: "Approved", color: "text-green-600" },
    rejected: { label: "Rejected", color: "text-red-600" },
  };

  const status =
    statusConfig[claim.status as keyof typeof statusConfig] ||
    statusConfig.pending;

  return (
    <Card className="overflow-hidden border-gray-200 hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Image */}
          {claim.founditem.image_url ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <Image
                src={claim.founditem.image_url}
                alt={claim.founditem.item_name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-1">
                  {claim.founditem.item_name}
                </h3>
                <p className="text-xs text-gray-500 capitalize">
                  {claim.founditem.category}
                </p>
              </div>
              {claim.status === "pending" ? (
                <button
                  onClick={() => onVerify("approve")}
                  className="text-xs font-medium text-fetch-red hover:underline ml-2"
                >
                  {status.label}
                </button>
              ) : (
                <span className={`text-xs font-medium ${status.color} ml-2`}>
                  {status.label}
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 mb-2 line-clamp-1">
              {claim.student.first_name} {claim.student.last_name}
            </p>

            {claim.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onVerify("approve")}
                  className="flex-1 h-8 text-xs bg-fetch-red hover:bg-fetch-red/90"
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onVerify("deny")}
                  className="flex-1 h-8 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Deny
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
