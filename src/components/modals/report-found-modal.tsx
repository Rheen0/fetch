"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { uploadImage } from "@/utils/supabase/storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "./image-upload";
import { toast } from "sonner";
import { Loader2, CheckCircle, X } from "lucide-react";

interface ReportFoundModalProps {
  securityId: number;
  onClose?: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Accessories",
  "Books",
  "Sports Equipment",
  "Keys",
  "Bags",
  "Stationery",
  "Personal Items",
  "Other",
];

export function ReportFoundModal({
  securityId,
  onClose,
  onSuccess,
}: ReportFoundModalProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    description: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemName || !formData.category || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Upload image if provided
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile, "found-items");
      }

      // Insert found item
      const { data, error } = await supabase
        .from("founditem")
        .insert({
          security_id: securityId,
          item_name: formData.itemName,
          category: formData.category,
          description: formData.description,
          image_url: imageUrl,
          found_location: formData.location,
          found_at: new Date().toISOString(),
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Show success state
      setShowSuccess(true);

      // Wait 2 seconds then close and trigger refresh
      setTimeout(() => {
        onSuccess();
        onClose?.();
      }, 2000);
    } catch (error: any) {
      console.error("Error reporting found item:", error);
      toast.error(error.message || "Failed to report found item");
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Good Job
            </h3>
            <p className="text-sm text-gray-600 text-center">
              You just helped someone find their lost item.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Found Item Post</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div>
            <Label>Add Photo</Label>
            <div className="mt-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImageFile(file);
                }}
              />
              {imageFile && (
                <p className="text-sm text-gray-500 mt-1">
                  Selected: {imageFile.name}
                </p>
              )}
            </div>
          </div>

          {/* Item Name */}
          <div>
            <Label htmlFor="itemName">
              Item Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="itemName"
              placeholder="Enter Item Name"
              value={formData.itemName}
              onChange={(e) =>
                setFormData({ ...formData, itemName: e.target.value })
              }
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">
              Location for collecting item{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              placeholder="Location for collecting item"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Item Description</Label>
            <Textarea
              id="description"
              placeholder="Enter Specific Description (e.g color, size etc.)"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-fetch-red hover:bg-fetch-red/90"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
