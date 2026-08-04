"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SASH_IMAGES } from "../lib/sash-images";

type SashImageCarouselProps = {
  intervalMs?: number;
  className?: string;
  objectPosition?: string;
  overlayClassName?: string;
};

/**
 * Keeps all slides mounted and crossfades via opacity so images appear instantly
 * (no remount / re-fetch on every slide change).
 */
export default function SashImageCarousel({
  intervalMs = 4500,
  className = "absolute inset-0",
  objectPosition = "object-[center_20%]",
  overlayClassName = "absolute inset-0 bg-black/60",
}: SashImageCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SASH_IMAGES.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  // Warm the browser cache for upcoming slides
  useEffect(() => {
    const next = (index + 1) % SASH_IMAGES.length;
    const after = (index + 2) % SASH_IMAGES.length;
    [next, after].forEach((i) => {
      const img = new window.Image();
      img.src = SASH_IMAGES[i].src;
    });
  }, [index]);

  return (
    <div className={className}>
      {SASH_IMAGES.map((image, i) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            quality={70}
            sizes="100vw"
            className={`object-cover ${objectPosition}`}
          />
        </div>
      ))}
      {overlayClassName ? <div className={overlayClassName} /> : null}
    </div>
  );
}
