"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { getCourseById, updateCourse } from "@/redux/slices/admin/courseSlice";
import { Input } from "@/components/ui/input";
import { EditableField } from "@/components/common/EditableField";
import { useRouter, useParams } from "next/navigation";
import type { AppDispatch } from "@/redux/store";

/* =======================
   Types
======================= */

interface Module {
  title: string;
  zoomLink: string;
  downloadLink: string;
}

interface CourseForm {
  title: string;
  description: string;
  image: string | File;
  duration: string;
  timing: string;
  language: string;
  price: string;
  salePrice: string;
  banner: string;
  seat: string;
  whatsAppLink: string;
  telegramLink: string;
  modules: Module[];
}

/* =======================
   Component
======================= */

const UpdateCoursePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // ✅ SAFE params handling (FIX)
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [loading, setLoading] = useState<boolean>(true);

  const [form, setForm] = useState<CourseForm>({
    title: "",
    description: "",
    image: "",
    duration: "",
    timing: "",
    language: "",
    price: "",
    salePrice: "",
    banner: "",
    seat: "",
    whatsAppLink: "",
    telegramLink: "",
    modules: [{ title: "", zoomLink: "", downloadLink: "" }],
  });

  /* =======================
     FETCH COURSE
  ======================= */

useEffect(() => {
  if (!id) return;

  const fetchCourse = async (): Promise<void> => {
    try {
      const res = await dispatch(
        getCourseById({ id }) // ✅ FIX HERE
      ).unwrap();

      setForm({
        title: res.title ?? "",
        description: res.description ?? "",
        image: res.image ?? "",
        duration: res.duration ?? "",
        timing: res.timing ?? "",
        language: res.language ?? "",
        price: res.price ?? "",
        salePrice: res.salePrice ?? "",
        banner: res.banner ?? "",
        seat: res.seat ?? "",
        whatsAppLink: res.whatsAppLink ?? "",
        telegramLink: res.telegramLink ?? "",
        modules:
          Array.isArray(res.modules) && res.modules.length > 0
            ? res.modules
            : [{ title: "", zoomLink: "", downloadLink: "" }],
      });
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchCourse();
}, [id, dispatch]);


  /* =======================
     HANDLERS
  ======================= */

  const handleFieldChange = (field: keyof CourseForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleModuleChange = (
    index: number,
    field: keyof Module,
    value: string
  ) => {
    const updated = [...form.modules];
    updated[index][field] = value;
    setForm((prev) => ({ ...prev, modules: updated }));
  };

  const addModule = () => {
    setForm((prev) => ({
      ...prev,
      modules: [...prev.modules, { title: "", zoomLink: "", downloadLink: "" }],
    }));
  };

  const removeModule = (index: number) => {
    const updated = [...form.modules];
    updated.splice(index, 1);
    setForm((prev) => ({ ...prev, modules: updated }));
  };

  /* =======================
     IMAGE HANDLERS
  ======================= */

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {
      setForm((prev) => ({ ...prev, image: file }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setForm((prev) => ({ ...prev, image: file }));
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
    const input = document.getElementById("imageInput") as HTMLInputElement | null;
    if (input) input.value = "";
  };

  /* =======================
     SUBMIT
  ======================= */

  const handleSubmit = async (): Promise<void> => {
    if (!id) return;

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("duration", form.duration);
      formData.append("timing", form.timing);
      formData.append("language", form.language);
      formData.append("price", form.price);
      formData.append("salePrice", form.salePrice);
      formData.append("whatsAppLink", form.whatsAppLink);
      formData.append("telegramLink", form.telegramLink);
      formData.append("seat", form.seat);
      formData.append("modules", JSON.stringify(form.modules));

      if (form.image instanceof File) {
        formData.append("image", form.image);
      }

      await dispatch(updateCourse({ id, data: formData })).unwrap();
      router.push("/admin/course");
    } catch (error: unknown) {
      console.error(error);
    }
  };

  if (loading) return <p className="p-10">Loading...</p>;

  /* =======================
     UI
  ======================= */

  return (
    <div className="w-full p-8 bg-white rounded-2xl shadow-lg space-y-8">
      <div className="flex sm:flex-row flex-col justify-between items-center gap-10">
        <Button
          onClick={handleSubmit}
          className="bg-[#0096FF] sm:hidden text-white w-full px-6 py-2 rounded-xl"
        >
          Update Course
        </Button>

        <EditableField
          value={form.title}
          onChange={(val) => handleFieldChange("title", val)}
          placeholder="Course Title"
          size="lg"
          className="w-full"
        />

        <Button
          onClick={handleSubmit}
          className="bg-[#0096FF] hidden sm:flex text-white px-6 py-2 rounded-xl"
        >
          Update Course
        </Button>
      </div>

      <div className="sm:flex justify-between gap-10">
        <div className="w-full space-y-5">
          <EditableField
            type="textarea"
            value={form.description}
            onChange={(val) => handleFieldChange("description", val)}
            placeholder="Course description"
          />

          <div className="flex items-center gap-2">
            <p className="text-2xl">₹</p>
            <EditableField
              value={form.price}
              onChange={(val) => handleFieldChange("price", val)}
              placeholder="Price"
              className="text-2xl"
            />
            <EditableField
              value={form.salePrice}
              onChange={(val) => handleFieldChange("salePrice", val)}
              placeholder="Sale Price"
              className="text-2xl line-through"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
          onClick={() => document.getElementById("imageInput")?.click()}
        >
          {form.image ? (
            <div className="relative inline-block">
              <Image
                src={
                  typeof form.image === "string"
                    ? form.image
                    : URL.createObjectURL(form.image)
                }
                alt="Course image preview"
                width={300}
                height={160}
                className="h-40 object-contain rounded"
              />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full"
              >
                ✕
              </button>
            </div>
          ) : (
            <p className="text-gray-500 p-10">
              Drag & drop image or{" "}
              <span className="text-[#0096FF]">click to upload</span>
            </p>
          )}

          <input
            type="file"
            id="imageInput"
            className="hidden"
            accept="image/*"
            onChange={handleImageSelect}
          />
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Curriculum</h2>
          <Button onClick={addModule} variant="outline" size="sm">
            <PlusCircle size={16} /> Add Module
          </Button>
        </div>

        {form.modules.map((mod, i) => (
          <div key={i} className="p-4 border rounded-xl flex gap-3">
            <Input
              placeholder="Module Title"
              value={mod.title}
              onChange={(e) =>
                handleModuleChange(i, "title", e.target.value)
              }
            />
            <Input
              placeholder="Zoom Link"
              value={mod.zoomLink}
              onChange={(e) =>
                handleModuleChange(i, "zoomLink", e.target.value)
              }
            />
            <Input
              placeholder="Download Link"
              value={mod.downloadLink}
              onChange={(e) =>
                handleModuleChange(i, "downloadLink", e.target.value)
              }
            />
            {form.modules.length > 1 && (
              <Trash2
                onClick={() => removeModule(i)}
                className="text-red-500 cursor-pointer"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdateCoursePage;
