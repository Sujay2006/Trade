"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

/* =======================
   Interfaces
======================= */

interface BlogContentBlock {
  type: "text" | "image";
  value: string;
}

interface Blog {
  _id: string;
  title: string;
  likes: number;
  views: number;
  createdAt: string;
  content: BlogContentBlock[];
}

/* =======================
   Helper
======================= */

const getFirstImage = (content: BlogContentBlock[]) => {
  const img = content.find((b) => b.type === "image");
  return img ? img.value : null;
};

/* =======================
   Component
======================= */

export default function AdminBlog() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================
     Fetch Blogs
  ======================= */

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/admin/blog/get");
      const data = await res.json();
      setBlogs(data);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  /* =======================
     Delete Blog
  ======================= */

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    await fetch(`/api/admin/blog/${id}`, {
      method: "DELETE",
    });

    setBlogs((prev) => prev.filter((b) => b._id !== id));
  };

  /* =======================
     Stats
  ======================= */

  const totalBlogs = blogs.length;
  const totalLikes = blogs.reduce((sum, b) => sum + b.likes, 0);
  const totalViews = blogs.reduce((sum, b) => sum + b.views, 0);

  return (
    <div className="space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold">
            Blog Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your trading blogs and track performance
          </p>
        </div>

        <Button
          onClick={() => router.push("/admin/blog/new")}
          className="bg-black text-white rounded-xl"
        >
          + New Blog
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Blogs" value={totalBlogs} />
        <StatCard title="Total Likes" value={totalLikes} />
        <StatCard title="Total Views" value={totalViews} />
      </div>

      {/* Blog Cards */}
      {loading ? (
        <p>Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="text-muted-foreground">No blogs found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((blog) => {
            const thumbnail = getFirstImage(blog.content);

            return (
              <Card
                key={blog._id}
                className="cursor-pointer hover:shadow-lg transition relative overflow-hidden"
                onClick={() => router.push(`/admin/blog/${blog._id}`)}
              >
                {/* Image */}
                {thumbnail && (
                  <img
                    src={thumbnail}
                    alt="Blog thumbnail"
                    className="h-40 w-full object-cover"
                  />
                )}

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(blog._id);
                  }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full px-2 text-xs text-red-600 hover:bg-white"
                >
                  ✕
                </button>

                <CardHeader>
                  <CardTitle className="text-base line-clamp-2">
                    {blog.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="text-sm flex justify-between text-muted-foreground space-y-1">
                  <p>❤️ Likes: {blog.likes}</p>
                  <p>👁 Views: {blog.views}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =======================
   Stat Card
======================= */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="text-xs text-muted-foreground">
          Across all blogs
        </p>
      </CardContent>
    </Card>
  );
}
