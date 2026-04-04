import { Metadata } from "next";
import Banner from "@/components/public/banner";
import HomeCourse from "@/components/public/homeCourse";
import LatestBlogsCarousel from "@/components/public/LatestBlogsCarousel";
import MentorSection from "@/components/public/MentorSection";
import { MessageCircle, Send, ArrowUpRight } from "lucide-react";
import Link from "next/link";

/* =======================
    SEO Metadata 
======================= */
export const metadata: Metadata = {
  title: "Master Stock Market & Options Trading | Rohit Sharma Mentorship",
  description: "Learn professional trading strategies, price action, and risk management from Rohit Sharma. Join 5,000+ students mastering the Indian Stock Market.",
  keywords: ["Stock Market Course", "Options Trading India", "Learn Trading", "Rohit Sharma Trader", "Price Action Strategy"],
  // ... rest of your metadata
};

export default function Home() {
  return (
    <main className="py-5">
      <Banner />

      {/* COMMUNITY LINKS SECTION */}
      <section className="max-w-7xl mt-10 mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Card */}
          <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 flex items-center justify-between group hover:border-green-100 transition-all">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                <MessageCircle size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">WhatsApp Community</h3>
                <p className="text-sm text-gray-500 font-medium">Get instant trade alerts & updates</p>
              </div>
            </div>
            <Link 
              href="/login" // Or your specific community link logic
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-green-600 transition-colors"
            >
              Join Now <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Telegram Card */}
          <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 flex items-center justify-between group hover:border-blue-100 transition-all">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <Send size={28} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Telegram Channel</h3>
                <p className="text-sm text-gray-500 font-medium">Free study materials & analysis</p>
              </div>
            </div>
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-gray-900 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-blue-500 transition-colors"
            >
              Join Now <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <div className="space-y-10">
        <section id="popular-courses">
          <HomeCourse />
        </section>

        <section id="latest-insights" className="bg-gray-50 py-16">
          <LatestBlogsCarousel />
        </section>

        <section id="about-mentor">
          <MentorSection />
        </section>
      </div>
      
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "EducationEvent",
            "name": "Professional Trading Mentorship",
            "description": "Expert-led stock market and options trading courses.",
            "organizer": {
              "@type": "Person",
              "name": "Rohit Sharma"
            }
          })
        }}
      />
    </main>
  );
}