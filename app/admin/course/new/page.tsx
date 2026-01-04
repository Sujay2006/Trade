"use client";

import React, { useState, ChangeEvent, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { createCourse } from "@/redux/slices/admin/courseSlice";
import { Input } from "@/components/ui/input";
import { EditableField } from "@/components/common/EditableField";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { AppDispatch } from "@/redux/store"; // ✅ Import your Dispatch type

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
const NewCoursePage = () => {
  const dispatch = useDispatch<AppDispatch>(); // ✅ Typed dispatch
  const router = useRouter();

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
      Handlers
     ======================= */
  const handleFieldChange = (field: keyof CourseForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleModuleChange = (
    index: number,
    field: keyof Module,
    value: string
  ) => {
    setForm((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[index] = {
        ...updatedModules[index],
        [field]: value,
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const addModule = () => {
    setForm((prev) => ({
      ...prev,
      modules: [...prev.modules, { title: "", zoomLink: "", downloadLink: "" }],
    }));
  };

  const removeModule = (index: number) => {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  /* =======================
      Image Handlers
     ======================= */
  const handleImageDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setForm((prev) => ({ ...prev, image: file }));
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setForm((prev) => ({ ...prev, image: file }));
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
    const input = document.getElementById("imageInput") as HTMLInputElement;
    if (input) input.value = "";
  };

  /* =======================
      Submission
     ======================= */
  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      // Append standard fields
      const fieldsToAppend: (keyof CourseForm)[] = [
        "title", "description", "duration", "timing", "language", 
        "price", "salePrice", "whatsAppLink", "telegramLink", "seat"
      ];

      fieldsToAppend.forEach((field) => {
        formData.append(field, form[field] as string);
      });

      // Handle Files
      if (form.image instanceof File) {
        formData.append("image", form.image);
      }
      
      // If banner is used for a string/date, append it
      formData.append("banner", form.banner);

      // Array -> String
      formData.append("modules", JSON.stringify(form.modules));

      const result = await dispatch(createCourse(formData)).unwrap();

      if (result) {
        router.push("/admin/course");
      }
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <div className="w-full p-8 bg-white rounded-2xl shadow-lg space-y-8">
      {/* Header */}
      <div className="flex sm:flex-row flex-col justify-between items-center gap-10">
        <Button
          onClick={handleSubmit}
          className="bg-[#0096FF] sm:hidden text-white w-full px-6 py-2 rounded-xl"
        >
          Save Course
        </Button>
        <EditableField
          value={form.title}
          onChange={(val) => handleFieldChange("title", val)}
          placeholder="Add Course Title"
          size="lg"
          className="w-full"
        />
        <Button
          onClick={handleSubmit}
          className="bg-[#0096FF] hidden sm:flex text-white px-6 py-2 rounded-xl"
        >
          Save Course
        </Button>
      </div>

      <div className="sm:flex justify-between gap-10">
        <div className="w-full flex flex-col justify-between space-y-5">
          <EditableField
            type="textarea"
            value={form.description}
            onChange={(val) => handleFieldChange("description", val)}
            placeholder="Add course description"
          />

          <div className="flex items-center gap-2">
            <p className="w-fit text-2xl font-medium">₹</p>
            <EditableField
              value={form.price}
              onChange={(val) => handleFieldChange("price", val)}
              placeholder="Price"
              className="w-fit text-2xl font-medium"
            />
            <EditableField
              value={form.salePrice}
              onChange={(val) => handleFieldChange("salePrice", val)}
              placeholder="Sale Price"
              className="w-fit text-2xl font-medium line-through"
            />
          </div>

          <div className="flex justify-between items-center gap-5">
            <div>
              <EditableField
                value={form.whatsAppLink}
                onChange={(val) => handleFieldChange("whatsAppLink", val)}
                placeholder="WhatsApp Link"
                className="w-fit text-xl font-medium"
              />
              <EditableField
                value={form.telegramLink}
                onChange={(val) => handleFieldChange("telegramLink", val)}
                placeholder="Telegram Link"
                className="w-fit text-xl font-medium"
              />
            </div>
            <EditableField
              value={form.seat}
              onChange={(val) => handleFieldChange("seat", val)}
              placeholder="Seat"
              className="w-fit text-xl font-medium"
            />
          </div>
        </div>

        {/* Image Upload Area */}
        <div
          className="border-2 mt-5 sm:mt-0 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#0096FF] transition"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
          onClick={() => document.getElementById("imageInput")?.click()}
        >
          {form.image ? (
            <div className="relative inline-block">
              <Image
                src={typeof form.image === "string" ? form.image : URL.createObjectURL(form.image)}
                alt="Preview"
                width={300}
                height={160}
                className="mx-auto h-40 object-contain rounded"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
          ) : (
            <p className="text-gray-500 p-10">
              Drag & drop image here or <span className="text-[#0096FF]">click to upload</span>
            </p>
          )}
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border shadow-xl rounded-xl p-5">
        <EditableField
          value={form.banner}
          onChange={(val) => handleFieldChange("banner", val)}
          placeholder="Start Date"
          className="text-center text-2xl font-medium"
          label="Start Date"
        />
        <EditableField
          value={form.duration}
          onChange={(val) => handleFieldChange("duration", val)}
          placeholder="Duration"
          className="text-center text-2xl font-medium"
          label="Duration"
        />
        <EditableField
          value={form.timing}
          onChange={(val) => handleFieldChange("timing", val)}
          placeholder="Class Timing"
          className="text-center text-2xl font-medium"
          label="Class Timing"
        />
        <EditableField
          value={form.language}
          onChange={(val) => handleFieldChange("language", val)}
          placeholder="Language"
          className="text-center text-2xl font-medium"
          label="Language"
        />
      </div>

      {/* Modules */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Curriculum</h2>
          <Button onClick={addModule} variant="outline" size="sm" className="flex gap-1 items-center">
            <PlusCircle size={16} /> Add Module
          </Button>
        </div>

        {form.modules.map((mod, i) => (
          <div key={i} className="p-4 border rounded-xl flex flex-col sm:flex-row gap-3 items-center w-full">
            <Input
              placeholder="Module Title"
              value={mod.title}
              onChange={(e) => handleModuleChange(i, "title", e.target.value)}
            />
            <Input
              placeholder="Zoom Link"
              value={mod.zoomLink}
              onChange={(e) => handleModuleChange(i, "zoomLink", e.target.value)}
            />
            <Input
              placeholder="Download Link"
              value={mod.downloadLink}
              onChange={(e) => handleModuleChange(i, "downloadLink", e.target.value)}
            />
            {form.modules.length > 1 && (
              <Trash2 onClick={() => removeModule(i)} className="cursor-pointer text-red-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewCoursePage;