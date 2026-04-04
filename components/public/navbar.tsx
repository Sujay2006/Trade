"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
// import { logoutUser } from "@/redux/slices/auth/authSlice"; // Ensure this exists
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown, BookOpen } from "lucide-react";
import { logOutUser } from "@/redux/slices/auth/authSlice";

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 py-3 flex items-center justify-between">
      {/* Left: Logo */}
      <Link href="/" className="flex items-center hover:opacity-80 transition">
        <Image src="/next.svg" alt="Logo" width={100} height={30} />
      </Link>

      {/* Middle: Links */}
      <div className="hidden md:flex items-center gap-8">
        {["Course", "Blog"].map((item) => (
          <Link
            key={item}
            href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
            className="text-sm font-semibold text-gray-600 hover:text-black transition"
          >
            {item === "Course" ? "Courses" : item === "Blog" ? "Blogs" : item}
          </Link>
        ))}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {!isAuthenticated ? (
          <Link
            href="/login"
            className="px-6 py-2 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition"
          >
            Login
          </Link>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded-full transition"
            >
              <Image
                src={user?.profilePicture || "/default-avatar.jpg"}
                alt="User"
                width={36}
                height={36}
                className="rounded-full border border-gray-200"
              />
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 py-3 flex items-center gap-3">
                  <Image
                    src={user?.profilePicture || "/default-avatar.jpg"}
                    alt="User"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 truncate w-32">{user?.userName}</span>
                    <span className="text-[10px] text-gray-500 truncate w-32">{user?.email}</span>
                  </div>
                </div>
                
                <hr className="my-2 border-gray-50" />
                
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <User size={16} /> My Profile
                </Link>
                {/* <Link
                  href="/dashboard/my-courses"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                >
                  <BookOpen size={16} /> My Learning
                </Link> */}
                
                <hr className="my-2 border-gray-50" />
                
                <button
                  onClick={() => {
                    dispatch(logOutUser());
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;