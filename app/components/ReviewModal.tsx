"use client";

import { useState } from "react";
import { X, Star, Heart, Send } from "lucide-react";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
}

export default function ReviewModal({ isOpen, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment);
      // Show success message
      setIsSuccess(true);
      // Wait 2 seconds then close modal
      setTimeout(() => {
        setRating(0);
        setComment("");
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show toast notification on success
  const showToast = isSuccess && !isSubmitting;

  const handleClose = () => {
    setRating(0);
    setComment("");
    setHoveredStar(0);
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;
  
  console.log("ReviewModal isOpen:", isOpen);

  return (
    <>
      {/* Success Toast Pop-up */}
      {showToast && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-slide-down">
          <div className="bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 min-w-[300px] max-w-md">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Submitted Successfully!</p>
              <p className="text-xs text-white/90 mt-0.5">Your review has been submitted.</p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2">
              How was your experience?
            </h2>
            <p className="text-black">
              Your feedback helps us improve our service
            </p>
          </div>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="px-6 pb-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">
                Review Submitted Successfully!
              </h3>
              <p className="text-sm text-green-600">
                Thank you for your feedback. It will help us improve our service.
              </p>
            </div>
          </div>
        )}

        {/* Rating Section */}
        {!isSuccess && (
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <div className="flex justify-center space-x-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoveredStar || rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>
            
            {rating > 0 && (
              <div className="text-sm text-black">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </div>
            )}
          </div>

          {/* Comment Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Tell us more (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about your purchase..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all text-black"
              rows={3}
              maxLength={500}
            />
            <div className="text-right text-xs text-black mt-1">
              {comment.length}/500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Review</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleClose}
              className="w-full text-black hover:text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
        )}

        {/* Bottom decoration */}
        <div className="h-2 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-b-3xl"></div>
      </div>
    </div>
    </>
  );
}
