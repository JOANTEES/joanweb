"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  mainImage?: string;
  onImageSelect?: (imageUrl: string) => void;
  showThumbnails?: boolean;
  maxThumbnails?: number;
  className?: string;
}

export default function ImageGallery({
  images,
  mainImage,
  onImageSelect,
  showThumbnails = true,
  maxThumbnails = 6,
  className = "",
}: ImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const hasInitialized = useRef(false);

  // Filter out empty/null images and ensure we have valid URLs
  const validImages = images?.filter((img) => img && img.trim() !== "") || [];

  // Use mainImage as first image if provided, otherwise use first image from array
  const displayImages =
    mainImage && !validImages.includes(mainImage)
      ? [mainImage, ...validImages]
      : validImages;

  // Set initial selected image only once when component mounts
  useEffect(() => {
    if (displayImages.length > 0 && !hasInitialized.current) {
      setSelectedImageIndex(0);
      hasInitialized.current = true;
    }
  }, [displayImages.length]);

  // Handle image selection
  const handleImageSelect = (imageUrl: string, index: number) => {
    setSelectedImageIndex(index);
    onImageSelect?.(imageUrl);
  };

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  }, [displayImages.length]);

  const goToNext = useCallback(() => {
    setSelectedImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  }, [displayImages.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        setIsZoomed(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  // Don't render if no images
  if (displayImages.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
      >
        <div className="text-gray-500 text-center p-8">
          <div className="text-4xl mb-2">📷</div>
          <p>No images available</p>
        </div>
      </div>
    );
  }

  const currentImage = displayImages[selectedImageIndex];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Image Display */}
      <div className="relative group">
        <div
          className={`relative overflow-hidden rounded-lg bg-gray-100 ${
            isZoomed ? "fixed inset-0 z-50 bg-black" : "aspect-square max-h-96"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt={`Product image ${selectedImageIndex + 1}`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? "cursor-zoom-out" : "cursor-zoom-in hover:scale-105"
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            onError={(e) => {
              // Fallback for broken images
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-image.svg";
            }}
          />

          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-80 hover:opacity-100 transition-opacity duration-200 z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-80 hover:opacity-100 transition-opacity duration-200 z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {selectedImageIndex + 1} / {displayImages.length}
            </div>
          )}

          {/* Zoom Indicator */}
          <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isZoomed ? "Click to zoom out" : "Click to zoom"}
          </div>
        </div>

        {/* Close zoom button */}
        {isZoomed && (
          <button
            onClick={() => setIsZoomed(false)}
            className="fixed top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
            aria-label="Close zoom"
          >
            ✕
          </button>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && displayImages.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {displayImages.slice(0, maxThumbnails).map((image, index) => (
            <button
              key={index}
              onClick={() => handleImageSelect(image, index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === selectedImageIndex
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback for broken thumbnails
                  const target = e.target as HTMLImageElement;
                  target.src = "/placeholder-image.svg";
                }}
              />
            </button>
          ))}

          {/* Show more indicator if there are more images */}
          {displayImages.length > maxThumbnails && (
            <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
              +{displayImages.length - maxThumbnails}
            </div>
          )}
        </div>
      )}

      {/* Mobile swipe indicator */}
      {displayImages.length > 1 && (
        <div className="text-center text-sm text-gray-500 md:hidden">
          Swipe or use arrows to navigate
        </div>
      )}
    </div>
  );
}
