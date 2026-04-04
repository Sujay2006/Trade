"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCourses } from "@/redux/slices/admin/courseSlice";
import CourseCard from "@/components/public/courseCard";
import type { AppDispatch, RootState } from "@/redux/store";
import { Search, SlidersHorizontal, BookOpen, Clock, Globe } from "lucide-react";

/* =======================
   Sort Types
======================= */
type SortOption =
  | "starting-soon"
  | "date-over"
  | "price-low-high"
  | "price-high-low";

export default function CoursePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { courses, loading } = useSelector((state: RootState) => state.course);

  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("starting-soon");

  useEffect(() => {
    dispatch(getCourses());
  }, [dispatch]);

  /* =======================
      Filter + Sort Logic
  ======================= */
  const filteredCourses = useMemo(() => {
    let list = [...courses];

    if (search.trim()) {
      list = list.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Helper to safely convert potentially string prices to numbers for arithmetic
    const getPrice = (val: string | number | undefined | null) => {
      if (val === undefined || val === null) return 0;
      return typeof val === "string" ? parseFloat(val) : val;
    };

    switch (sort) {
      case "starting-soon":
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "date-over":
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "price-low-high":
        list.sort((a, b) => 
          (getPrice(a.salePrice) || getPrice(a.price)) - (getPrice(b.salePrice) || getPrice(b.price))
        );
        break;
      case "price-high-low":
        list.sort((a, b) => 
          (getPrice(b.salePrice) || getPrice(b.price)) - (getPrice(a.salePrice) || getPrice(a.price))
        );
        break;
    }

    return list;
  }, [courses, search, sort]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 bg-white min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Our Programs</h1>
          <p className="text-gray-500 font-medium max-w-md">
            Master the markets with our structured trading curriculum and expert mentorship.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0096FF] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Find a course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#0096FF]/10 focus:border-[#0096FF] transition-all font-medium"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="w-full sm:w-auto pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-2xl outline-none appearance-none cursor-pointer focus:border-[#0096FF] font-bold text-sm text-gray-700"
            >
              <option value="starting-soon">Latest First</option>
              <option value="date-over">Oldest First</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* COURSE LISTING */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 w-full bg-gray-50 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500 font-bold">No courses match your search.</p>
          <button onClick={() => setSearch("")} className="mt-2 text-[#0096FF] font-bold underline">Clear search</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredCourses.map((course) => (
            <div key={course._id} className="group relative transition-all duration-300">
              <CourseCard
                _id={course._id}
                title={course.title}
                description={course.description}
                image={course.image}
                // Convert string to number for the CourseCard prop
                price={typeof course.price === "string" ? parseFloat(course.price) : course.price}
                salePrice={typeof course.salePrice === "string" ? parseFloat(course.salePrice) : course.salePrice}
                duration={course.duration}
                language={course.language}
              />
              
              <div className="mt-4 flex items-center gap-4 px-2">
                 <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <Clock size={14} className="text-[#0096FF]" />
                    {course.duration}
                 </div>
                 <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <Globe size={14} className="text-[#0096FF]" />
                    {course.language}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FOOTER CALL TO ACTION */}
      <div className="mt-20 p-10 bg-black rounded-[2.5rem] text-center text-white">
        <h3 className="text-2xl font-black mb-2">Can&apos;t decide where to start?</h3>
        <p className="text-gray-400 mb-6">Chat with our experts to find the right path for your trading journey.</p>
        <button className="bg-[#0096FF] px-8 py-4 rounded-2xl font-black hover:scale-105 transition-transform">
            Talk to an Expert
        </button>
      </div>
    </section>
  );
}