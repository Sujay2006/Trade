"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Pagination } from "swiper/modules";
import { ArrowRight, Newspaper } from "lucide-react"; // Added for better UI
import Image from "next/image";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface BlogContentBlock {
  type: "text" | "image";
  value: string;
}

interface Blog {
  _id: string;
  title: string;
  createdAt: string;
  content: BlogContentBlock[];
}

export default function LatestBlogsCarousel() {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/blog/get`)
      .then((res) => res.json())
      .then((data) => setBlogs(data.slice(0, 6))); // Increased to 6 for better carousel feel
  }, []);

  if (blogs.length === 0) return null;

  return (
    <div className=" max-w-7xl px-1">
      {/* Header with "Explore All" Link */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
            <Newspaper size={16} />
            <span>Market Journal</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Latest Insights</h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            Stay ahead with professional trading strategies and market updates.
          </p>
        </div>
        
        <Link 
          href="/blog" 
          className="group flex items-center gap-2 text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors"
        >
          View All Articles
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="relative group/swiper">
        <Swiper
          modules={[EffectCoverflow, Navigation, Pagination]}
          effect="coverflow"
          grabCursor
          centeredSlides
          loop={blogs.length > 3}
          // 👇 Responsive Adjustments
          slidesPerView={1.2} // Show partial slides on mobile to indicate scroll
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
            slideShadows: false,
          }}
          className="!pb-16"
        >
          {blogs.map((blog) => {
            const image = blog.content.find((c) => c.type === "image")?.value;

            return (
              <SwiperSlide key={blog._id} className="transition-all duration-500">
                <Link
                  href={`/blog/${blog._id}`}
                  className="block rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group/card"
                >
                  <div className="relative h-[240px] w-full overflow-hidden">
                    <Image
                      src={image || "/placeholder-blog.jpg"}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
                  </div>

                  <div className="p-6">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-2 line-clamp-2 leading-tight group-hover/card:text-blue-600 transition-colors">
                      {blog.title}
                    </h3>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* 👇 Custom Navigation Buttons - Hidden on Mobile, Shown on Hover on Desktop */}
        <button className="swiper-button-prev-custom absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg  items-center justify-center text-gray-800 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover/swiper:opacity-100 hidden lg:flex">
          <ArrowRight className="rotate-180" size={20} />
        </button>
        <button className="swiper-button-next-custom absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg items-center justify-center text-gray-800 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover/swiper:opacity-100 hidden lg:flex">
          <ArrowRight size={20} />
        </button>
      </div>

      <style jsx global>{`
        .swiper-pagination-bullet-active {
          background: #2563eb !important;
          width: 20px !important;
          border-radius: 5px !important;
        }
      `}</style>
    </div>
  );
}