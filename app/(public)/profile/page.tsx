"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { getCourses } from "@/redux/slices/admin/courseSlice";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import CourseCard from "@/components/public/courseCard";
import Image from "next/image";
import { Mail, Phone, User as UserIcon } from "lucide-react";

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { courses } = useSelector((state: RootState) => state.course);

  // Filter courses that the user is enrolled in (matching your DB logic)
  const myEnrolledCourses = courses.filter((course: any) =>
    course.students?.some((s: any) => (s.user?._id || s.user) === user?.id)
  );
    useEffect(() => {
    dispatch(getCourses());
  }, [dispatch]);

  if (!isAuthenticated) return <div className="p-20 text-center">Please login to view profile.</div>;

  
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 min-h-screen">
      {/* Profile Header */}
      <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 mb-12">
        <div className="relative">
          <Image
            src={user?.profilePicture || "/default-avatar.jpg"}
            alt="Profile"
            width={120}
            height={120}
            className="rounded-full border-4 border-blue-50 shadow-md"
          />
        </div>
        
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-3xl font-black text-gray-900">{user?.userName}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={18} className="text-blue-500" />
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={18} className="text-blue-500" />
              <span className="font-medium">{user?.phone || "No phone added"}</span>
            </div>
          </div>
        </div>
        
        {/* <button className="px-6 py-2 border-2 border-gray-100 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
          Edit Profile
        </button> */}
      </div>

      {/* Enrolled Courses */}
      <div className="space-y-8">
        <h2 className="text-2xl font-black text-gray-900">My Enrolled Courses</h2>
        
        {myEnrolledCourses.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">You haven't enrolled in any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {myEnrolledCourses.map((course: any) => (
              <CourseCard key={course._id} {...course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}