"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/common/EditableField";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

/* =======================
   Types
======================= */

type BlogBlockType = "text" | "image";

interface BlogBlock {
  type: BlogBlockType;
  value: string | File | null;
}

interface BlockRendererProps {
  block: BlogBlock;
  index: number;
  content: BlogBlock[];
  setContent: React.Dispatch<React.SetStateAction<BlogBlock[]>>;
  removeBlock: (i: number) => void;
  moveBlock: (i: number, dir: "up" | "down") => void;
}

/* =======================
   Update Blog Page
======================= */

export default function UpdateBlog() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState<BlogBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* =======================
     Fetch Blog
  ======================= */

useEffect(() => {
  const fetchBlog = async () => {
    try {
      const res = await fetch(`/api/admin/blog/${id}`);
      const data = await res.json();

      // 🔥 handle both API styles
      const blog = data.blog ?? data;

      if (!blog || !blog.title) {
        throw new Error("Invalid blog data");
      }

      setTitle(blog.title);

      setContent(
        (blog.content || []).map((block) => ({
          type: block.type,
          value: block.type === "image" ? block.value ?? null : block.value ?? "",
        }))
      );
    } catch (err) {
      console.error("Load blog failed:", err);
      alert("Failed to load blog");
    } finally {
      setLoading(false);
    }
  };

  if (id) fetchBlog();
}, [id]);


  /* =======================
     Helpers
  ======================= */

  const moveBlock = (index, direction) => {
    const updated = [...content];
    if (direction === "up" && index > 0) {
      [updated[index], updated[index - 1]] = [
        updated[index - 1],
        updated[index],
      ];
    }
    if (direction === "down" && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [
        updated[index + 1],
        updated[index],
      ];
    }
    setContent(updated);
  };

  const removeBlock = (index) => {
    setContent((prev) => prev.filter((_, i) => i !== index));
  };

  const addTextBlock = () => {
    setContent((prev) => [...prev, { type: "text", value: "" }]);
  };

  const addImageBlock = () => {
    setContent((prev) => [...prev, { type: "image", value: null }]);
  };

  /* =======================
     Update Blog
  ======================= */

  const updateBlog = async () => {
    if (!title.trim()) {
      alert("Title missing");
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append("title", title);

    const cleanContent: any[] = [];

    content.forEach((block) => {
      if (block.type === "image" && block.value instanceof File) {
        formData.append("images", block.value);
        cleanContent.push({ type: "image" });
      } else {
        cleanContent.push(block);
      }
    });

    formData.append("content", JSON.stringify(cleanContent));

    const res = await fetch(`/api/admin/blog/${id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    setSaving(false);

    if (data.success) {
      alert("Blog updated successfully!");
      router.push("/admin/blog");
    } else {
      alert("Error: " + data.message);
    }
  };

  if (loading) return <p className="p-10">Loading...</p>;

  /* =======================
     UI
  ======================= */

  return (
    <div className="max-w-5xl p-6 space-y-6 bg-white rounded-xl shadow">
      {/* Title */}
      <EditableField
        value={title}
        onChange={setTitle}
        placeholder="Edit Blog Title"
        size="lg"
      />

      {/* Blocks */}
      {content.map((block, index) => (
        <BlockRenderer
          key={index}
          block={block}
          index={index}
          content={content}
          setContent={setContent}
          removeBlock={removeBlock}
          moveBlock={moveBlock}
        />
      ))}

      {/* Controls */}
      <div className="flex gap-4">
        <Button onClick={addTextBlock}>+ Add Text</Button>
        <Button onClick={addImageBlock}>+ Add Image</Button>
      </div>

      {/* Save */}
      <Button className="w-full mt-6" onClick={updateBlog} disabled={saving}>
        {saving ? "Updating..." : "Update Blog"}
      </Button>
    </div>
  );
}

/* =======================
   Block Renderer
======================= */

function BlockRenderer({
  block,
  index,
  content,
  setContent,
  removeBlock,
  moveBlock,
}: BlockRendererProps) {
  return (
    <div className="relative flex group">
      <div className="flex flex-col justify-between gap-1">
        <Button size="icon" variant="ghost" onClick={() => moveBlock(index, "up")}>
          <ChevronUp size={14} />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => moveBlock(index, "down")}
        >
          <ChevronDown size={14} />
        </Button>
      </div>

      <button
        onClick={() => removeBlock(index)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hidden group-hover:flex items-center justify-center"
      >
        ✕
      </button>

      {block.type === "text" ? (
        <EditableField
          type="textarea"
          value={String(block.value ?? "")}
          placeholder="Edit text..."
          onChange={(val) => {
            const updated = [...content];
            updated[index].value = val;
            setContent(updated);
          }}
          className="w-full flex items-center"
        />
      ) : (
        <ImageDropZone
          block={block}
          index={index}
          content={content}
          setContent={setContent}
        />
      )}
    </div>
  );
}

/* =======================
   Image Drop Zone
======================= */

function ImageDropZone({ block, index, content, setContent }) {
  const handleImage = (file) => {
    if (!file) return;
    const updated = [...content];
    updated[index].value = file;
    setContent(updated);
  };

  const removeImage = () => {
    const updated = [...content];
    updated[index].value = null;
    setContent(updated);
  };

  return (
    <div
      className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#0096FF]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleImage(e.dataTransfer.files?.[0]);
      }}
      onClick={() => document.getElementById(`image-${index}`)?.click()}
    >
      {block.value instanceof File ? (
        <img
          src={URL.createObjectURL(block.value)}
          className="mx-auto max-h-[400px] rounded"
        />
      ) : typeof block.value === "string" ? (
        <img
          src={block.value}
          className="mx-auto max-h-[400px] rounded"
        />
      ) : (
        <p className="text-gray-500">
          Drag & drop image or{" "}
          <span className="text-[#0096FF]">click to upload</span>
        </p>
      )}

      {block.value && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeImage();
          }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
        >
          ✕
        </button>
      )}

      <input
        id={`image-${index}`}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleImage(e.target.files?.[0])}
      />
    </div>
  );
}
