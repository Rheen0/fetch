"use client";

import { useState } from "react";
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
import { toast } from "sonner";
import { X, MapPin } from "lucide-react";
import { ImageUpload } from "./image-upload";
import { updateFoundItem } from "@/app/dashboard/inventory/actions";
import type { FoundItem } from "@/lib/types";

interface EditFoundModalProps {
  item: FoundItem;
  securityId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORIES = [
  "Electronics",
  "Clothing",
  "Accessories",
  "Books",
  "Documents",
  "Keys",
  "Bags",
  "Sports Equipment",
  "School Supplies",
  "Personal",
  "Identification",
  "Academic",
  "Personal Items",
  "Other",
];

const COMMON_LOCATIONS = [
  "Library",
  "Cafeteria",
  "Student Union",
  "Gym/Sports Complex",
  "Classroom Building",
  "Computer Lab",
  "Parking Lot",
  "Dormitory",
  "Lecture Hall",
  "Science Building",
  "Engineering Building",
  "Math Building",
  "Student Center",
  "Security Office",
  "Other",
];

export function EditFoundModal({ item, securityId, onClose, onSuccess }: EditFoundModalProps) {
  const [formData, setFormData] = useState({
    item_name: item.item_name,
    description: item.description || "",
    category: item.category,
    found_location: item.found_location || "",
    image_url: item.image_url || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.item_name || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const result = await updateFoundItem({
        foundId: item.found_id,
        ...formData,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to update item");
      }

      toast.success("Item updated successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update item"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Edit Found Item</h2>
              <p className="text-sm text-gray-500 mt-1">Update found item details</p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label htmlFor="item_name" className="text-sm font-medium text-gray-900">Item Name *</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) =>
                setFormData({ ...formData, item_name: e.target.value })
              }
              placeholder="e.g., Blue Backpack, iPhone 13"
              className="mt-2 h-11"
              required
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-sm font-medium text-gray-900">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="mt-2 h-11">
                <SelectValue placeholder="Select a category" />
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

          <div>
            <Label
              htmlFor="found_location"
              className="flex items-center gap-2 text-sm font-medium text-gray-900"
            >
              <MapPin className="h-4 w-4 text-fetch-red" />
              Found Location
            </Label>
            <Select
              value={formData.found_location}
              onValueChange={(value) =>
                setFormData({ ...formData, found_location: value })
              }
            >
              <SelectTrigger className="mt-2 h-11">
                <SelectValue placeholder="Where was it found?" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-2">
              Location where the item can be collected
            </p>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-900">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe the found item in detail (color, brand, distinctive features)..."
              rows={4}
              className="mt-2 resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Include colors, brands, or unique identifiers
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900">Upload Image</Label>
            <div className="mt-2">
              <ImageUpload
                currentImage={formData.image_url}
                onImageUploaded={(url) =>
                  setFormData({ ...formData, image_url: url })
                }
                bucket="items"
                userId={securityId.toString()}
                itemType="found"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-fetch-red hover:bg-fetch-red/90 text-white font-medium"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                "Update Item"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
