"use client"; // We need this for the search state

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ArrowRight } from "lucide-react"; // Install lucide-react if not already

/* =======================
   Types
======================= */
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

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch blogs on mount
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/blog/get`);
        const data = await res.json();
        setBlogs(data);
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  // Filter logic
  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Market Insights</h1>
          <p className="text-gray-500 mt-2 font-medium">
            Strategies and updates to help you navigate the markets.
          </p>
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all font-medium text-gray-700"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-48 w-full bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <p className="text-gray-400 font-medium">
          No articles found matching &quot;{searchQuery}&quot;
        </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {filteredBlogs.map((blog) => {
            const firstImage = blog.content.find((b) => b.type === "image")?.value;
            const firstText = blog.content.find((b) => b.type === "text")?.value;

            return (
              <Link
                key={blog._id}
                href={`/blog/${blog._id}`}
                className="group flex flex-col md:flex-row gap-8 p-2 rounded-3xl hover:bg-gray-50/50 transition-all duration-300"
              >
                {/* IMAGE - FIXED SIZE & ASPECT RATIO */}
                <div className="relative w-full md:w-64 h-44 flex-shrink-0 overflow-hidden rounded-2xl shadow-sm border border-gray-100">
                  {firstImage ? (
                    <Image
                      src={firstImage}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 256px"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-200">
                       <Search size={40} />
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="flex flex-col justify-center flex-1 py-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">
                    {new Date(blog.createdAt).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric'
                    })}
                  </span>

                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h2>

                  <p className="mt-3 text-gray-500 line-clamp-2 leading-relaxed text-sm">
                    {firstText || "Access full insights and detailed analysis for this market move..."}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-blue-600 font-extrabold text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    Read Story <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}