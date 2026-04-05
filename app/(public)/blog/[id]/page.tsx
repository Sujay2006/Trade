import Image from "next/image";
import LikeButton from "../../../../components/public/LikeButton";

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
  likes: number;
  views: number;
  createdAt: string;
  content: BlogContentBlock[];
}

/* =======================
   Fetch blog by ID
======================= */

async function getBlog(id: string): Promise<Blog> {
  const res = await fetch(
    `/api/public/blog/${id}`,
    { cache: "no-store" } // ensures views++
  );

  if (!res.ok) {
    throw new Error("Failed to fetch blog");
  }

  return res.json();
}

/* =======================
   Page
======================= */

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ FIX: unwrap params
  const { id } = await params;

  const blog = await getBlog(id);

  return (
    <section className="max-w-3xl mx-auto px-4 py-10">
      {/* Title */}
      <h1 className="text-3xl font-semibold mb-2">{blog.title}</h1>

      {/* Content */}
      <article className="space-y-6">
        {blog.content.map((block, index) =>
          block.type === "image" ? (
            <Image
              key={index}
              src={block.value}
              alt="Blog image"
              className="w-full rounded-xl"
              width={800}
              height={500}
            />
          ) : (
            <p
              key={index}
              className="text-gray-700 leading-7 text-lg"
            >
              {block.value}
            </p>
          )
        )}
      </article>
         {/* Meta info */}
      <div className="flex items-center justify-between gap-4 text-sm text-gray-500 mt-6">
        <span>{new Date(blog.createdAt).toDateString()}</span>
        <div className="">
        <LikeButton
          like={blog.likes}
          blogId={blog._id}
        />
      </div>
        <span>👀 {blog.views}</span>
      </div>
      {/* Like button */}
      
    </section>
  );
}
