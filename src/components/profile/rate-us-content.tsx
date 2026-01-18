"use client";

import Link from "next/link";
import { ChevronLeft, Star } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { submitRating } from "@/app/profile/rate/actions";

interface RateUsContentProps {
  profile: {
    id: string;
    first_name: string;
    last_name: string;
    user_type: string;
  };
  email: string;
}

export function RateUsContent({ profile, email }: RateUsContentProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [displayName, setDisplayName] = useState(
    `${profile.first_name} ${profile.last_name}`
  );
  const [showOnLanding, setShowOnLanding] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!feedback.trim()) {
      toast.error("Please provide feedback");
      return;
    }

    setLoading(true);

    try {
      const result = await submitRating({
        userId: profile.id,
        rating,
        feedback: feedback.trim(),
        displayName: showOnLanding ? displayName.trim() : null,
        showOnLanding,
        userType: profile.user_type,
      });

      if (result.success) {
        toast.success("Thank you for your feedback!", {
          description: showOnLanding
            ? "Your rating will appear on our landing page after approval."
            : "Your rating has been submitted successfully.",
        });
        setRating(0);
        setFeedback("");
        setDisplayName(`${profile.first_name} ${profile.last_name}`);
        setShowOnLanding(false);
      } else {
        toast.error("Error", {
          description: result.error || "Failed to submit rating",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Link href="/profile" className="text-gray-900">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Rate Us</h1>
        </div>
      </div>

      <div className="mx-auto max-w-md px-4 py-6">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              How was your experience?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your feedback helps us improve FETCH
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Star Rating */}
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-12 w-12 ${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-center text-sm font-medium text-gray-600">
                {rating === 1 && "Poor - We'll do better"}
                {rating === 2 && "Fair - Room for improvement"}
                {rating === 3 && "Good - We're getting there"}
                {rating === 4 && "Very Good - Almost perfect!"}
                {rating === 5 && "Excellent - Thank you!"}
              </p>
            )}

            {/* Feedback */}
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Tell us more *
              </Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your experience with FETCH..."
                rows={4}
                className="resize-none"
                required
              />
            </div>

            {/* Display on Landing Page */}
            <div className="rounded-lg border border-gray-200 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="showOnLanding"
                  checked={showOnLanding}
                  onChange={(e) => setShowOnLanding(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <div className="flex-1">
                  <label
                    htmlFor="showOnLanding"
                    className="text-sm font-medium text-gray-900 cursor-pointer"
                  >
                    Display my testimonial on the landing page
                  </label>
                  <p className="mt-1 text-xs text-gray-600">
                    Your feedback will be reviewed and may appear in our
                    testimonials section
                  </p>
                </div>
              </div>

              {showOnLanding && (
                <div>
                  <Label
                    htmlFor="displayName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="How should we display your name?"
                    className="mt-1"
                    required={showOnLanding}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This is how your name will appear on the website
                  </p>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-600">Submitting as:</p>
              <p className="font-medium text-gray-900">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-sm text-gray-600">{email}</p>
              <p className="text-xs text-gray-500 mt-1">
                {profile.user_type === "student"
                  ? "Student"
                  : "Security Personnel"}
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || rating === 0 || !feedback.trim()}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? "Submitting..." : "Submit Rating"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
