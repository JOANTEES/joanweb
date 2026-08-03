"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import Navigation from "./components/Navigation";
import ReviewModal from "./components/ReviewModal";
import { Spotlight } from "./components/ui/spotlight-new";
import { TextGenerateEffect } from "./components/ui/text-generate-effect";
import { HoverEffect } from "./components/ui/hover-effect";
import { Button as MovingBorderButton } from "./components/ui/moving-border";
import { api } from "./utils/api";
import { useAuth } from "./contexts/AuthContext";

const heroImages = [
  { src: "/sash-1.jpeg", alt: "Custom graduation Sash — Class of 2026" },
  { src: "/sash-2.jpeg", alt: "Custom graduation Sash — God Did" },
  { src: "/sash-3.jpeg", alt: "Custom graduation Sash — University of Ghana" },
  { src: "/sash-4.jpeg", alt: "Custom graduation Sash design" },
  { src: "/sash-5.jpeg", alt: "Premium custom Sash" },
  { src: "/sash-6.jpeg", alt: "Personalized graduation Sash" },
  { src: "/sash-7.jpeg", alt: "JoanTee custom Sash" },
  { src: "/sash-8.jpeg", alt: "Custom graduation Sash — This Far By Grace" },
];

const gallery = [
  {
    src: "/sash-1.jpeg",
    alt: "Birmingham City University graduation Sash",
    caption: "Class of 2026",
  },
  {
    src: "/sash-2.jpeg",
    alt: "University of Ghana graduation Sash",
    caption: "God Did",
  },
  {
    src: "/sash-3.jpeg",
    alt: "Custom embroidered graduation Sash",
    caption: "Made for you",
  },
  {
    src: "/sash-4.jpeg",
    alt: "Custom graduation Sash design",
    caption: "Your story",
  },
  {
    src: "/sash-5.jpeg",
    alt: "Premium custom Sash",
    caption: "Premium finish",
  },
  {
    src: "/sash-6.jpeg",
    alt: "Personalized graduation Sash",
    caption: "Personalize it",
  },
  {
    src: "/sash-7.jpeg",
    alt: "JoanTee custom Sash",
    caption: "Celebrate",
  },
  {
    src: "/sash-8.jpeg",
    alt: "Custom graduation Sash — This Far By Grace",
    caption: "This Far By Grace",
  },
];

const reasons = [
  {
    title: "Fast Delivery",
    description:
      "Orders arrive in 24–48 hours — anytime, anywhere you need them.",
    link: "/sash",
  },
  {
    title: "Premium Quality",
    description:
      "Every Sash is chosen for craft, comfort, and lasting style.",
    link: "/sash",
  },
  {
    title: "Easy Tracking",
    description:
      "Follow your order from checkout to doorstep in one simple place.",
    link: "/orders",
  },
];

export default function Home() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const handleReviewSubmit = async (
    rating: number,
    comment: string
  ): Promise<void> => {
    try {
      const reviewData: {
        rating: number;
        review_text: string;
        guest_name?: string;
      } = {
        rating,
        review_text: comment,
      };

      if (!isAuthenticated) {
        reviewData.guest_name = "Guest User";
      }

      const result = await api.post("/reviews", reviewData);

      if (result.success) {
        return;
      } else {
        throw new Error(result.message || "Failed to submit review");
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to submit review. Please try again.");
    }
  };

  return (
    <>
      {/* Hero — brand, headline, support, CTAs, full-bleed sash photos */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroImages[heroIndex].src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1 }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[heroIndex].src}
              alt={heroImages[heroIndex].alt}
              fill
              priority
              sizes="100vw"
              className="object-cover object-[center_20%]"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/60 to-black" />
        <Spotlight />
        <Navigation transparent />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-[family-name:var(--font-script)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-yellow-400 tracking-normal mb-8 leading-tight"
          >
            Sashup with JoanTee
          </motion.p>

          <TextGenerateEffect
            words="DESIGN YOUR PERFECT SASH IN MINUTES"
            className="font-sans text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-[0.12em] uppercase text-white max-w-4xl mx-auto mb-6 [&_span]:text-white"
            duration={0.35}
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="font-sans text-neutral-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Choose your background, personalize your design and let Sashup with
            JoanTee create a premium custom sash for your special moment
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* SHOP_DISABLED: Temporarily hide Shop Clothing CTA
            <Link href="/shop">
              <MovingBorderButton
                as="div"
                borderRadius="9999px"
                containerClassName="h-14 w-44"
                className="bg-yellow-400/95 text-black font-semibold border-none hover:bg-yellow-300 transition-colors"
                duration={2500}
              >
                Shop Clothing
              </MovingBorderButton>
            </Link>
            */}
            <Link href="/sash">
              <MovingBorderButton
                as="div"
                borderRadius="9999px"
                containerClassName="h-14 w-52"
                className="bg-yellow-400/95 text-black font-semibold border-none hover:bg-yellow-300 transition-colors tracking-wide"
                duration={2500}
              >
                CREATE MY SASH
              </MovingBorderButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Gallery — new Sash photos */}
      <section className="relative py-24 bg-black border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,215,0,0.06),_transparent_55%)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-white mb-3">
              The Sash collection
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              Real designs. Real moments. Made for every celebration.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {gallery.map((item, idx) => (
              <Link
                key={item.src}
                href="/sash"
                className="group relative aspect-[3/4] overflow-hidden bg-neutral-900"
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                <p className="absolute bottom-4 left-4 right-4 font-[family-name:var(--font-display)] text-white text-xl tracking-wide">
                  {item.caption}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/sash"
              className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-3.5 rounded-full font-semibold transition-colors"
            >
              Explore Sash
            </Link>
          </div>
        </div>
      </section>

      {/* Why JoanTee */}
      <section className="py-20 bg-neutral-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl text-white mb-3">
              Why Sashup with JoanTee
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              Simple service. Thoughtful Sash pieces. Delivered with care.
            </p>
          </div>
          <HoverEffect items={reasons} className="max-w-5xl mx-auto" />
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-28 bg-black text-white border-t border-white/5 overflow-hidden">
        <Spotlight
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(45, 100%, 70%, .08) 0, hsla(45, 100%, 55%, .02) 50%, hsla(45, 100%, 45%, 0) 80%)"
          duration={9}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl mb-5">
            Ready when you are
          </h2>
          <p className="text-lg text-neutral-400 mb-10 max-w-lg mx-auto">
            Sash for the moments that matter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* SHOP_DISABLED: Temporarily hide Start Shopping CTA
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-3.5 rounded-full font-semibold transition-colors"
            >
              Start Shopping
            </Link>
            */}
            <Link
              href="/sash"
              className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-300 text-black px-8 py-3.5 rounded-full font-semibold transition-colors"
            >
              Explore Sash
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setIsReviewModalOpen(true)}
            className="mt-10 text-sm text-neutral-500 hover:text-yellow-400 transition-colors underline-offset-4 hover:underline"
          >
            Share your experience
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 text-white py-14 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="Sashup with JoanTee Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-[family-name:var(--font-display)] text-2xl">
                  Sashup with JoanTee
                </span>
              </div>
              <p className="text-neutral-500 text-sm leading-relaxed">
                Premium custom Sash with fast delivery.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-wide uppercase text-neutral-300 mb-4">
                Collections
              </h3>
              <ul className="space-y-2">
                {/* SHOP_DISABLED: Temporarily hide Shop footer link
                <li>
                  <Link
                    href="/shop"
                    className="text-neutral-500 hover:text-yellow-400 transition-colors text-sm"
                  >
                    Shop
                  </Link>
                </li>
                */}
                <li>
                  <Link
                    href="/sash"
                    className="text-neutral-500 hover:text-yellow-400 transition-colors text-sm"
                  >
                    Sash
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-wide uppercase text-neutral-300 mb-4">
                Support
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="text-neutral-500 hover:text-yellow-400 transition-colors text-sm"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-wide uppercase text-neutral-300 mb-4">
                Connect
              </h3>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.instagram.com/sashup_with_joantee/"
                  className="text-neutral-500 hover:text-yellow-400 transition-colors text-sm"
                >
                  Instagram
                </a>
                <a
                  href="https://vm.tiktok.com/ZMAhGntUb/0"
                  className="text-neutral-500 hover:text-yellow-400 transition-colors text-sm"
                >
                  TikTok
                </a>
                <a
                  href="https://snapchat.com/t/B1sJXJdX"
                  className="text-neutral-500 hover:text-yellow-400 transition-colors text-sm"
                >
                  Snapchat
                </a>
                <a
                  href="https://chat.whatsapp.com/FC3C47wb7wk6Op4XeNkECc?mode=wwc"
                  className="text-neutral-500 hover:text-yellow-400 transition-colors text-sm"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm">
              <Link
                href="/privacy-policy"
                className="text-neutral-500 hover:text-yellow-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-neutral-500 hover:text-yellow-400 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
            <p className="text-neutral-600 text-sm">
              &copy; {new Date().getFullYear()} Sashup with JoanTee. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}
