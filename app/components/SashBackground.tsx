"use client";

import SashImageCarousel from "./SashImageCarousel";

export default function SashBackground({
  intervalMs = 4500,
}: {
  intervalMs?: number;
}) {
  return <SashImageCarousel intervalMs={intervalMs} />;
}
