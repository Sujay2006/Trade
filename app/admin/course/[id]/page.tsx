"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { getCourseById, updateCourse } from "@/redux/slices/admin/courseSlice";
import { Input } from "@/components/ui/input";
import { EditableField } from "@/components/common/EditableField";
import { useRouter, useParams } from "next/navigation";

const UpdateCoursePage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
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

  /* ---------------- FETCH COURSE ---------------- */
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await dispatch(getCourseById(id)).unwrap();

        setForm({
          title: res.title || "",
          description: res.description || "",
          image: res.image || "",
          duration: res.duration || "",
          timing: res.timing || "",
          language: res.language || "",
          price: res.price || "",
          salePrice: res.salePrice || "",
          banner: res.banner || "",
          seat: res.seat || "",
          whatsAppLink: res.whatsAppLink || "",
          telegramLink: res.telegramLink || "",
          modules:
            res.modules?.length > 0
              ? res.modules
              : [{ title: "", zoomLink: "", downloadLink: "" }],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourse();
  }, [id, dispatch]);

  /* ---------------- HANDLERS ---------------- */
  const handleFieldChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    console.log(form);
    
  };

  const handleModuleChange = (index: number, field: string, value: string) => {
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

  /* ---------------- IMAGE ---------------- */
  const handleImageDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {
      setForm((prev) => ({ ...prev, image: file }));
    }
  };

  const handleImageSelect = (e: any) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setForm((prev) => ({ ...prev, image: file }));
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: "" }));
    const input = document.getElementById("imageInput") as HTMLInputElement;
    if (input) input.value = "";
  };

  /* ---------------- SUBMIT ---------------- */
const handleSubmit = async () => {
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

    // FILE
    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    // MODULES
    formData.append("modules", JSON.stringify(form.modules));

    // ✅ REAL DEBUG
    console.log("=== FORMDATA ===");
    for (const [k, v] of formData.entries()) {
      console.log(k, v);
    }

    await dispatch(updateCourse({ id, data: formData })).unwrap();
    router.push("/admin/course");
  } catch (err) {
    console.error(err);
  }
};


  if (loading) return <p className="p-10">Loading...</p>;

  /* ---------------- UI ---------------- */
  return (
    <div className="w-full p-8 bg-white rounded-2xl shadow-lg space-y-8">
      {/* Header */}
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

      {/* Description + Image */}
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
          <div className="flex justify-between items-center gap-5">
                    <div className="">
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

        {/* Image Upload */}
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
          onClick={() => document.getElementById("imageInput")?.click()}
        >
          {form.image ? (
            <div className="relative inline-block">
              <img
                src={
                  typeof form.image === "string"
                    ? form.image
                    : URL.createObjectURL(form.image)
                }
                className="h-40 object-contain rounded"
              />
              <button
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
