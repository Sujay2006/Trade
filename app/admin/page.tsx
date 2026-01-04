"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogs } from "@/redux/slices/admin/blogSlice";
import { getCourses } from "@/redux/slices/admin/courseSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";


interface Banner {
  _id: string;
  banner: string;
}

export default function AdminHome() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { courses} = useSelector((state: any) => state.course);
  const { blogs } = useSelector((state: any) => state.blog);

  const [banner, setBanner] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBanner, setNewBanner] = useState<File | null>(null);

    /* =======================
       Fetch Blogs
    ======================= */
  
    const fetchBanner = async () => {
      try {
        const res = await fetch("/api/admin/banner");
        const data = await res.json();
        setBanner(data.banners);
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoading(false);
      }
    };

    console.log(banner);
    
  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {
      setNewBanner(file);
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];

    if (file && file.type.startsWith("image/")) {
      setNewBanner(file);
      const formData = new FormData();
      formData.append("banner", file);
      const res = await fetch("/api/admin/banner", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data);
      if (data.success) {
        alert("Banner uploaded successfully");
        fetchBanner();
      } else {
        alert("Banner upload failed");
      }
      
    }
  };

  const removeImage = async(id) =>{
    const res = await fetch(`/api/admin/banner/${id}`, {
        method: "DELETE",
    });
    fetchBanner();
    
  }


  
    useEffect(() => {
      fetchBanner();
    }, []);

  useEffect(() => {
      dispatch(getCourses());
      dispatch(getBlogs());
    }, [dispatch]); 
  return (
    <div className="space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-1 font-semibold">
            Course Management
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your trading courses and track their performance
          </p>
        </div>
        {/* <Button
          // onClick={() => router.push("/admin/course/new")}
          className="bg-black text-white rounded-xl px-4 py-2 w-full sm:w-auto"
        >
          + New Course
        </Button> */}
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
            <div className="text-2xl font-semibold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              Active Blogs in your academy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Revenu</CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-semibold">
              {[...new Set(courses.map((c: any) => c.language))].length || 0}
            </div> */}
            <p className="text-xs text-muted-foreground">
              Unique languages across all courses
            </p>
          </CardContent>
        </Card>
      </div>
              {/* Banner  */}
      <div className="flex gap-5">
        {banner.map((b) => (
           <div key={b._id} className="relative inline-block">
              <img
                src={
                  typeof b.banner === "string"
                    ? b.banner
                    : URL.createObjectURL(b.banner)
                }
                alt="Preview"
                className="mx-auto h-40 object-contain rounded"
              />

              {/* ❌ Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(b._id);
                }}
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
          onClick={() => document.getElementById("imageInput").click()}
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
