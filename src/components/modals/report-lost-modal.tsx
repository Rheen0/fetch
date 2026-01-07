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
import { reportLostItem } from "@/app/dashboard/actions";

interface ReportLostModalProps {
  studentId: number;
  onClose: () => void;
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
  "Other",
];

export function ReportLostModal({ studentId, onClose }: ReportLostModalProps) {
  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    category: "",
    last_seen_location: "",
    image_url: "",
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
      const result = await reportLostItem({
        studentId,
        ...formData,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to report item");
      }

      toast.success("Lost item reported successfully!", {
        description: "We're searching for matches...",
      });

      onClose();

      // Refresh after a short delay to show toast
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Error reporting lost item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to report lost item"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 hover:bg-gray-100 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Report Lost Item
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="item_name">Item Name *</Label>
            <Input
              id="item_name"
              value={formData.item_name}
              onChange={(e) =>
                setFormData({ ...formData, item_name: e.target.value })
              }
              placeholder="e.g., Blue Backpack, iPhone 13"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
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
              htmlFor="last_seen_location"
              className="flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Last Seen Location
            </Label>
            <Select
              value={formData.last_seen_location}
              onValueChange={(value) =>
                setFormData({ ...formData, last_seen_location: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Where did you last see it?" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_LOCATIONS.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Optional, but helps us find matches
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your lost item in detail (color, brand, distinctive features)..."
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              Include colors, brands, or unique identifiers
            </p>
          </div>

          <div>
            <Label>Upload Image</Label>
            <ImageUpload
              onImageUploaded={(url) =>
                setFormData({ ...formData, image_url: url })
              }
              bucket="items"
              userId={studentId.toString()}
              itemType="lost"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-fetch-red hover:bg-fetch-red/90"
              disabled={loading}
            >
              {loading ? "Reporting..." : "Report Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
