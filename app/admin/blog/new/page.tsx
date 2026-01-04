"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EditableField } from "@/components/common/EditableField";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

/* =======================
   Types / Interfaces
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
}

/* =======================
   Main Component
======================= */

export default function AddBlog() {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<BlogBlock[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const moveBlock = (index: number, direction: "up" | "down") => {
    const updated = [...content];
    if (direction === "up" && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    } else if (direction === "down" && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    }
    setContent(updated);
  };

  

  const addTextBlock = () => {
    setContent((prev) => [...prev, { type: "text", value: "" }]);
  };

  const addImageBlock = () => {
    setContent((prev) => [...prev, { type: "image", value: null }]);
  };

  const removeBlock = (index: number) => {
    setContent((prev) => prev.filter((_, i) => i !== index));
  };

  /* =======================
     Save Blog
  ======================= */

const saveBlog = async () => {
  if (!title.trim()) {
    alert("Title missing");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);

  const cleanContent: any[] = [];

  content.forEach((block) => {
    if (block.type === "image" && block.value instanceof File) {
      // Send the actual file to Multer
      formData.append("images", block.value);
      // Send a placeholder in the JSON so the server knows where the image goes
      cleanContent.push({ type: "image" });
    } else {
      cleanContent.push(block);
    }
  });

  formData.append("content", JSON.stringify(cleanContent));

  const res = await fetch("/api/admin/blog/create", {
    method: "POST",
    body: formData, // No headers needed, browser sets multipart/form-data
  });

  const data = await res.json();
  if (data.success) {
    alert("Blog saved successfully!");
    router.push("/admin/blog");
  } else {
    alert("Error: " + data.message);
  }
};

  return (
    <div className="max-w-5xl p-6 space-y-6 bg-white rounded-xl shadow">
      {/* Title */}
      <EditableField
        value={title}
        onChange={setTitle}
        placeholder="Add Blog Title"
        size="lg"
      />

      {/* Content Blocks */}
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
        <Button type="button" onClick={addTextBlock}>
          + Add Text
        </Button>
        <Button type="button" onClick={addImageBlock}>
          + Add Image
        </Button>
      </div>

      {/* Save */}
      <Button
        className="w-full mt-6"
        onClick={saveBlog}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Blog"}
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
}: BlockRendererProps & { removeBlock: (i: number) => void }) {
  return (
    <div className="relative flex  group">
      <div className="  flex flex-col justify-between gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveBlock(index, "up")}><ChevronUp size={14}/></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => moveBlock(index, "down")}><ChevronDown size={14}/></Button>
      </div>
      {/* Delete icon */}
      <button
        onClick={() => removeBlock(index)}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hidden group-hover:flex items-center justify-center"
      >
        ✕
      </button>

      {block.type === "text" ? (
        <EditableField
          type="textarea"
          placeholder="Write your paragraph..."
          value={String(block.value ?? "")}
          onChange={(val) => {
            const updated = [...content];
            updated[index].value = val;
            setContent(updated);
          }}
          className="w-full"
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

function ImageDropZone({
  block,
  index,
  content,
  setContent,
}: {
  block: BlogBlock;
  index: number;
  content: BlogBlock[];
  setContent: React.Dispatch<React.SetStateAction<BlogBlock[]>>;
}) {
  const handleImage = (file: File | null) => {
    if (!file) return;
    const updated = [...content];
    updated[index].value = file;
    setContent(updated);
  };

  return (
    <div
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#0096FF] transition"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleImage(e.dataTransfer.files?.[0] ?? null);
      }}
      onClick={() =>
        document.getElementById(`image-${index}`)?.click()
      }
    >
      {block.value instanceof File ? (
        <img
          src={URL.createObjectURL(block.value)}
          alt="Preview"
          className="mx-auto max-h-[400px] rounded"
        />
      ) : (
        <p className="text-gray-500">
          Drag & drop image or{" "}
          <span className="text-[#0096FF]">click to upload</span>
        </p>
      )}

      <input
        id={`image-${index}`}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
