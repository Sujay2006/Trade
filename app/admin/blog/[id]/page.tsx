"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/common/EditableField";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

type BlogBlockType = "text" | "image";

interface BlogBlock {
  type: BlogBlockType;
  value: string | File | null;
}

export default function UpdateBlog() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<BlogBlock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      try {
        const res = await fetch(`/api/admin/blog/${id}`);
        const data = await res.json();
        const blog = data.blog ?? data;
        setTitle(blog.title || "");
        setContent(
          (blog.content || []).map((b: any) => ({
            type: b.type,
            value: b.value ?? (b.type === "text" ? "" : null),
          }))
        );
      } catch (err) {
        alert("Failed to load blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  const moveBlock = (index: number, direction: "up" | "down") => {
    const updated = [...content];
    if (direction === "up" && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    } else if (direction === "down" && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    }
    setContent(updated);
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const updateBlog = async () => {
    if (!title.trim() || !id) return alert("Missing Title/ID");
    setSaving(true);

    try {
      // Convert all new Files to Base64 so we can send as JSON
      const finalContent = await Promise.all(
        content.map(async (block) => {
          if (block.type === "image" && block.value instanceof File) {
            const base64 = await toBase64(block.value);
            return { type: "image", value: base64 };
          }
          return { type: block.type, value: block.value };
        })
      );

      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: finalContent }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Blog updated!");
        router.push("/admin/blog");
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 flex items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-white rounded-xl shadow mt-10">
      <EditableField value={title} onChange={setTitle} placeholder="Blog Title" size="lg" />

      {content.map((block, index) => (
        <BlockRenderer
          key={index}
          block={block}
          index={index}
          content={content}
          setContent={setContent}
          removeBlock={(i) => setContent(content.filter((_, idx) => idx !== i))}
          moveBlock={moveBlock}
        />
      ))}

      <div className="flex gap-4">
        <Button onClick={() => setContent([...content, { type: "text", value: "" }])}>+ Text</Button>
        <Button onClick={() => setContent([...content, { type: "image", value: null }])}>+ Image</Button>
      </div>

      <Button className="w-full" onClick={updateBlog} disabled={saving}>
        {saving ? "Saving Changes..." : "Update Blog"}
      </Button>
    </div>
  );
}

function BlockRenderer({ block, index, content, setContent, removeBlock, moveBlock }: any) {
  return (
    <div className="relative flex group gap-3 border p-4 rounded-lg">
      <div className="flex flex-col">
        <Button size="icon" variant="ghost" onClick={() => moveBlock(index, "up")}><ChevronUp size={16} /></Button>
        <Button size="icon" variant="ghost" onClick={() => moveBlock(index, "down")}><ChevronDown size={16} /></Button>
      </div>

      <button onClick={() => removeBlock(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</button>

      {block.type === "text" ? (
        <textarea
          className="w-full p-2 border rounded resize-none focus:ring-2 focus:ring-blue-400 outline-none"
          rows={3}
          value={block.value}
          onChange={(e) => {
            const updated = [...content];
            updated[index].value = e.target.value;
            setContent(updated);
          }}
          placeholder="Start writing..."
        />
      ) : (
        <ImageDropZone block={block} index={index} content={content} setContent={setContent} />
      )}
    </div>
  );
}

function ImageDropZone({ block, index, content, setContent }: any) {
  const imageSrc = block.value instanceof File ? URL.createObjectURL(block.value) : block.value;

  return (
    <div 
      className="w-full border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
      onClick={() => document.getElementById(`file-${index}`)?.click()}
    >
      {imageSrc ? (
        <div className="relative inline-block">
          <img src={imageSrc} alt="Preview" className="max-h-60 rounded mx-auto" />
          <p className="text-xs text-gray-400 mt-2">Click to change image</p>
        </div>
      ) : (
        <p className="text-gray-400">Click or drag image here</p>
      )}
      <input
        id={`file-${index}`}
        type="file"
        hidden
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const updated = [...content];
            updated[index].value = file;
            setContent(updated);
          }
        }}
      />
    </div>
  );
}