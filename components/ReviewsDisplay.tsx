"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Star } from "lucide-react";

export default function ReviewsDisplay() {
  const reviews = useQuery(api.reviews.getReviews) || [];

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No reviews yet. Be the first to leave a review!
        </p>
      </div>
    );
  }

  // For mobile, only show first 3 reviews
  const mobileReviews = reviews.slice(0, 3);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">What Our Users Say</h3>

      {/* Mobile view - show only first 3 reviews */}
      <div className="md:hidden grid grid-cols-1 sm:grid-cols-3 gap-4">
        {mobileReviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>

      {/* Desktop view - show all 6 reviews in a 2x3 grid */}
      <div className="hidden md:grid grid-cols-3 gap-4 gap-y-6">
        {reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>
    </div>
  );
}

// Extracted ReviewCard component for reuse
function ReviewCard({ review }: { review: any }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">{review.name}</h4>
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
      <p className="text-gray-600 line-clamp-3">{review.comment}</p>
      <div className="mt-3 text-xs text-gray-400">
        {new Date(review.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
