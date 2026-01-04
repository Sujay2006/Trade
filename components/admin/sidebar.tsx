"use client";

import React, { useState } from "react";
import { AdminSideBar } from "@/config/formControls";
import { Cross, MenuIcon } from "lucide-react";
import { useRouter } from "next/navigation";
// import { useAppDispatch } from "@/redux/store"; // ✅ your typed dispatch hook
import { logOutUser } from "@/redux/slices/auth/authSlice";
import { useDispatch } from "react-redux";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // default closed on mobile
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logOutUser()).unwrap();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden p-2 fixed top-4 left-4 z-50 bg-gray-100 rounded-md shadow-md border border-gray-300">
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <Cross size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full lg:h-auto bg-gray-100 shadow-md transition-transform duration-300 ease-in-out w-64 p-4 flex flex-col justify-between
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div>
          <div className="font-extrabold text-2xl flex justify-between items-center mb-6">
            <span>Admin Panel</span>
            {/* Close icon visible only on mobile */}
            <div className="lg:hidden" onClick={() => setIsOpen(false)}>
              <Cross size={20} />
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {AdminSideBar.map((nav) => (
              <a
                key={nav.name}
                href={nav.href}
                onClick={() => setIsOpen(false)}
                className="p-2 rounded hover:bg-gray-200 cursor-pointer text-gray-800 font-medium"
              >
                {nav.name}
              </a>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white font-medium rounded-sm p-3 text-center hover:bg-red-600 mt-4"
        >
          Log Out
        </button>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;
