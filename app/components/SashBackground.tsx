"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

const sashImages = [
  { src: "/sash-1.jpeg", alt: "Custom graduation Sash" },
  { src: "/sash-2.jpeg", alt: "Custom graduation Sash" },
  { src: "/sash-3.jpeg", alt: "Custom graduation Sash" },
  { src: "/sash-4.jpeg", alt: "Custom graduation Sash" },
  { src: "/sash-5.jpeg", alt: "Custom graduation Sash" },
  { src: "/sash-6.jpeg", alt: "Custom graduation Sash" },
  { src: "/sash-7.jpeg", alt: "Custom graduation Sash" },
  { src: "/sash-8.jpeg", alt: "Custom graduation Sash" },
];

export default function SashBackground({
  intervalMs = 5000,
}: {
  intervalMs?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % sashImages.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={sashImages[index].src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1 }}
          className="absolute inset-0"
        >
          <Image
            src={sashImages[index].src}
            alt={sashImages[index].alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_20%]"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-black/60" />
    </>
  );
}
