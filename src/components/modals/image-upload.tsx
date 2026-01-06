"use client";

import { useState, useRef } from "react";
import { uploadItemImage } from "@/utils/supabase/storage";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  userId: string;
  itemType: 'lost' | 'found';
  onImageUploaded: (url: string, path: string) => void;
  currentImage?: string | null;
}

export function ImageUpload({ userId, itemType, onImageUploaded, currentImage }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Please choose an image smaller than 5MB",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please choose an image file",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      const { url, path, error } = await uploadItemImage(file, userId, itemType);

      if (error) {
        toast.error("Upload failed", {
          description: error.message,
        });
        setPreviewUrl(null);
        return;
      }

      if (url && path) {
        onImageUploaded(url, path);
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      toast.error("Error", {
        description: "Failed to upload image",
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onImageUploaded("", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Item Image (Optional)
      </label>
      
      {previewUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border-2 border-gray-200">
          <Image
            src={previewUrl}
            alt="Item preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white shadow-lg transition-colors hover:bg-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 transition-colors hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-red-600" />
              <span className="text-sm text-gray-600">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <div className="text-center">
                <span className="text-sm font-medium text-gray-700">
                  Click to upload image
                </span>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}