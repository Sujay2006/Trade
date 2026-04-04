"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { AppDispatch, RootState } from "@/redux/store";
import { getCourses } from "@/redux/slices/admin/courseSlice";
import CourseCard from "@/components/public/courseCard";

const HomeCourse = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { courses, loading } = useSelector(
    (state: RootState) => state.course
  );

  useEffect(() => {
    dispatch(getCourses());
  }, [dispatch]);

  // Show only top 3 featured courses
  const topCourses = courses.slice(0, 3);

  return (
    <section className="max-w-7xl mx-auto px-4 py-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[#0096FF] font-bold uppercase tracking-widest text-xs">
            <Sparkles size={16} />
            <span>Top Rated Programs</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            Master the Markets
          </h2>
          <p className="text-gray-500 font-medium max-w-lg leading-relaxed">
            From beginner basics to advanced options strategies—choose a learning path designed to make you a consistent, disciplined trader.
          </p>
        </div>

        {/* Explore All Button */}
        <Link 
          href="/course" 
          className="group flex items-center gap-2 bg-gray-50 text-gray-900 px-6 py-3 rounded-2xl font-bold border border-gray-100 hover:bg-black hover:text-white transition-all duration-300 shadow-sm"
        >
          Explore All Courses
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 w-full bg-gray-50 animate-pulse rounded-[2rem]" />
          ))}
        </div>
      ) : topCourses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold">New batches starting soon. Stay tuned!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {topCourses.map((course) => (
            <div key={course._id} className="transition-transform duration-300 hover:-translate-y-2">
              <CourseCard
                _id={course._id}
                title={course.title}
                description={course.description}
                image={course.image}
                price={typeof course.price === "string" ? parseFloat(course.price) : course.price}
                salePrice={typeof course.salePrice === "string" ? parseFloat(course.salePrice) : course.salePrice}
                duration={course.duration}
                language={course.language}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeCourse;