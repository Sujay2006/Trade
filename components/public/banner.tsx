"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/* =======================
   Types
======================= */

interface BannerItem {
  _id: string;
  banner: string;
}

/* =======================
   Component
======================= */

export default function BannerCarousel() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [current, setCurrent] = useState<number>(0);

  /* =======================
     Fetch banners
  ======================= */

  useEffect(() => {
    const fetchBanner = async (): Promise<void> => {
      try {
        const res = await fetch("/api/admin/banner");
        const data: { banners: BannerItem[] } = await res.json();
        setBanners(data.banners);
      } catch (error: unknown) {
        console.error("Failed to fetch banners", error);
      }
    };

    fetchBanner();
  }, []);

  /* =======================
     Auto scroll
  ======================= */

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000); // ⏱️ change slide every 4s

    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      {/* Slider */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((b) => (
          <div key={b._id} className="min-w-full">
            <Image
              src={b.banner}
              alt="Promotional banner"
              width={1920}
              height={600}
              priority
              className="w-full h-[200px] sm:h-[350px] lg:h-[400px] object-contain"
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition ${
              i === current ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
