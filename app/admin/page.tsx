"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogs } from "@/redux/slices/admin/blogSlice";
import { getCourses } from "@/redux/slices/admin/courseSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";

/* =======================
   Types
======================= */

interface Banner {
  _id: string;
  banner: string;
}

/* =======================
   Component
======================= */

export default function AdminHome() {
  const dispatch = useDispatch<AppDispatch>();

  const courses = useSelector((state: RootState) => state.course.courses);
  const blogs = useSelector((state: RootState) => state.blog.blogs);

  const [banner, setBanner] = useState<Banner[]>([]);

  /* =======================
     Fetch Banners
  ======================= */

  const fetchBanner = async (): Promise<void> => {
    try {
      const res = await fetch("/api/admin/banner");
      const data: { banners: Banner[] } = await res.json();
      setBanner(data.banners);
    } catch (error: unknown) {
      console.error("Failed to fetch banners", error);
    }
  };

  /* =======================
     Handlers
  ======================= */

  const handleImageDrop = async (
    e: React.DragEvent<HTMLDivElement>
  ): Promise<void> => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (!file || !file.type.startsWith("image/")) return;

    const formData = new FormData();
    formData.append("banner", file);

    const res = await fetch("/api/admin/banner", {
      method: "POST",
      body: formData,
    });

    const data: { success: boolean } = await res.json();

    if (data.success) {
      alert("Banner uploaded successfully");
      fetchBanner();
    }
  };

  const handleImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const formData = new FormData();
    formData.append("banner", file);

    const res = await fetch("/api/admin/banner", {
      method: "POST",
      body: formData,
    });

    const data: { success: boolean } = await res.json();

    if (data.success) {
      alert("Banner uploaded successfully");
      fetchBanner();
    } else {
      alert("Banner upload failed");
    }
  };

  const removeImage = async (id: string): Promise<void> => {
    await fetch(`/api/admin/banner/${id}`, { method: "DELETE" });
    fetchBanner();
  };

  /* =======================
     Effects
  ======================= */

  useEffect(() => {
    fetchBanner();
  }, []);

  useEffect(() => {
    dispatch(getCourses());
    dispatch(getBlogs());
  }, [dispatch]);

  /* =======================
     UI
  ======================= */

  return (
    <div className="space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl mb-1 font-semibold">
          Course Management
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your trading courses and track their performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              Active courses in your academy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Blogs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{blogs.length}</div>
            <p className="text-xs text-muted-foreground">
              Active blogs in your academy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Revenue analytics coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Banners */}
      <div className="flex gap-5 flex-wrap">
        {banner.map((b) => (
          <div key={b._id} className="relative inline-block">
            <Image
              src={b.banner}
              alt="Promotional banner"
              width={300}
              height={160}
              className="mx-auto h-40 object-contain rounded"
            />

            <button
              type="button"
              onClick={() => removeImage(b._id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        ))}

        <div
          className="border-2 mt-5 sm:mt-0 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#0096FF] transition"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
          onClick={() =>
            document.getElementById("imageInput")?.click()
          }
        >
          <p className="text-gray-500 p-10">
            Drag & drop Banner here or{" "}
            <span className="text-[#0096FF]">click to upload</span>
          </p>

          <input
            type="file"
            id="imageInput"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>
      </div>
    </div>
  );
}
