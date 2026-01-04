"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { createCourse } from "@/redux/slices/admin/courseSlice";
import { Input } from "@/components/ui/input";
import { EditableField } from "@/components/common/EditableField"; // adjust path
import { useRouter } from "next/navigation";

const NewCoursePage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    image:"",
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

  const handleFieldChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleModuleChange = (index, field, value) => {
    const updated = [...form.modules];
    updated[index][field] = value;
    setForm({ ...form, modules: updated });
  };

  const addModule = () => {
    setForm({
      ...form,
      modules: [...form.modules, { title: "", zoomLink: "", downloadLink: "" }],
    });
  };

  const removeModule = (index) => {
    const updated = [...form.modules];
    updated.splice(index, 1);
    setForm({ ...form, modules: updated });
  }

  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file && file.type.startsWith("image/")) {
      setForm((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

const handleImageSelect = (e) => {
  const file = e.target.files[0];

  if (file && file.type.startsWith("image/")) {
    setForm((prev) => ({
      ...prev,
      image: file,
    }));
  }
};

const removeImage = () => {
  setForm((prev) => ({
    ...prev,
    image: "",
  }));

  // reset input so same image can be re-selected
  const input = document.getElementById("imageInput") as HTMLInputElement;
  if (input) input.value = "";
};


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

// 👇 FILES
if (form.image instanceof File) {
  formData.append("image", form.image);
}

if (form.banner instanceof File) {
  formData.append("banner", form.banner);
}

// 👇 ARRAY → STRING
formData.append("modules", JSON.stringify(form.modules));
    const result = await dispatch(createCourse(formData)).unwrap();
    console.log(result);
    
    // result is already res.data from your thunk
    if(result){ // <- match your API response key
      router.push("/admin/course");
    }
    
    // Reset form
    setForm({
      title: "",
      description: "",
      image:"",
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
  } catch (err) {
    console.error(err);
  }
};


  return (
    <div className="w-full  p-8 bg-white rounded-2xl shadow-lg space-y-8">
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

      {/* Description */}
      <div className="sm:flex  justify-between gap-10">
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
        <div
          className="border-2 mt-5 sm:mt-0 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#0096FF] transition"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
          onClick={() => document.getElementById("imageInput").click()}
        >
          {form.image ? (
            <div className="relative inline-block">
              <img
                src={
                  typeof form.image === "string"
                    ? form.image
                    : URL.createObjectURL(form.image)
                }
                alt="Preview"
                className="mx-auto h-40 object-contain rounded"
              />

              {/* ❌ Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          ) : (
            <p className="text-gray-500 p-10">
              Drag & drop image here or{" "}
              <span className="text-[#0096FF]">click to upload</span>
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


      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border shadow-xl  rounded-xl p-5">
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
          <Button
            onClick={addModule}
            variant="outline"
            size="sm"
            className="flex gap-1 items-center"
          >
            <PlusCircle size={16} /> Add Module
          </Button>
        </div>

        {form.modules.map((mod, i) => (
          <div
            key={i}
            className="p-4 border rounded-xl flex flex-col sm:flex-row gap-3 items-center w-full"
          >
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
              onChange={(e) =>
                handleModuleChange(i, "downloadLink", e.target.value)
              }
            />
            {form.modules.length > 1 && (
              <Trash2
                onClick={() => removeModule(i)}
                className="cursor-pointer text-red-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewCoursePage;
