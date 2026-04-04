"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Users, Loader2, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { getCourseById, updateCourse } from "@/redux/slices/admin/courseSlice";
import { Input } from "@/components/ui/input";
import { EditableField } from "@/components/common/EditableField";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import type { AppDispatch } from "@/redux/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* =======================
   Types & Interfaces
======================= */

interface Module {
  title: string;
  zoomLink: string;
  downloadLink: string;
}

interface StudentUser {
  userName: string;
  email: string;
  phone?: string;
}

interface Student {
  user: StudentUser;
  status: string;
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
  students: Student[];
}

/* ✅ FIXED UpdatePayload */

interface UpdatePayload extends Omit<CourseForm, "image"> {
  image: string;
  [key: string]: unknown;
}

/* =======================
   Main Component
======================= */

const UpdateCoursePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";

  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

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
    students: [],
  });

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      try {
        const res = await dispatch(getCourseById({ id })).unwrap();

        setForm({
          ...res,
          modules: res.modules?.length
            ? res.modules
            : [{ title: "", zoomLink: "", downloadLink: "" }],
          students: res.students ?? [],
        });
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, dispatch]);

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
      modules: [
        ...prev.modules,
        { title: "", zoomLink: "", downloadLink: "" },
      ],
    }));
  };

  const removeModule = (index: number) => {
    setForm((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type.startsWith("image/")) {
      setForm((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!id) return;

    setIsUpdating(true);

    try {
      let imageBase64: string = "";

      if (form.image instanceof File) {
        const reader = new FileReader();

        imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.onloadend = () =>
            resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(form.image as File);
        });
      } else {
        imageBase64 = form.image;
      }

      const payload: UpdatePayload = {
        ...form,
        image: imageBase64,
      };

      await dispatch(
        updateCourse({
          id,
          data: payload,
        })
      ).unwrap();

      alert("Course updated successfully!");
      router.push("/admin/course");
    } catch (err) {
      console.error("Submit Error:", err);
      alert("Update failed. Check console for details.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 flex flex-col items-center justify-center gap-4">
        <Loader2
          className="animate-spin text-[#0096FF]"
          size={40}
        />
        <p className="text-gray-400">
          Loading course details...
        </p>
      </div>
    );

  return (
    <div className="w-full p-8 bg-white rounded-2xl shadow-lg space-y-8">

      {/* Header */}

      <div className="flex sm:flex-row flex-col justify-between items-center gap-6">
        <EditableField
          value={form.title}
          onChange={(val) =>
            handleFieldChange("title", val)
          }
          placeholder="Add Course Title"
          size="lg"
          className="w-full"
        />

        <Button
          onClick={handleSubmit}
          disabled={isUpdating}
          className="bg-[#0096FF] hover:bg-blue-600 text-white px-8 py-6 rounded-xl font-bold w-full sm:w-auto"
        >
          {isUpdating ? (
            <Loader2 className="animate-spin mr-2" />
          ) : (
            "Update Course"
          )}
        </Button>
      </div>


      <div className="flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full flex flex-col space-y-6">
          <EditableField
            type="textarea"
            value={form.description}
            onChange={(val) => handleFieldChange("description", val)}
            placeholder="Add course description"
          />

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-gray-50 p-2 rounded-lg border">
              <span className="text-2xl font-bold text-gray-400">₹</span>
              <EditableField
                value={form.price}
                onChange={(val) => handleFieldChange("price", val)}
                placeholder="Price"
                className="w-24 text-2xl font-bold"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-50 p-2 rounded-lg border">
              <span className="text-2xl font-bold text-gray-400 line-through">₹</span>
              <EditableField
                value={form.salePrice}
                onChange={(val) => handleFieldChange("salePrice", val)}
                placeholder="Sale"
                className="w-24 text-2xl font-bold line-through text-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Image Upload Area */}
        <div
          className="lg:w-1/3 border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center cursor-pointer hover:border-[#0096FF] transition bg-gray-50 flex flex-col items-center justify-center min-h-[250px]"
          onClick={() => document.getElementById("imageInput")?.click()}
        >
          {form.image ? (
            <div className="relative w-full">
              <Image
                src={typeof form.image === "string" ? form.image : URL.createObjectURL(form.image)}
                alt="Course Preview" 
                width={400} 
                height={225}
                unoptimized
                className="mx-auto max-h-52 object-cover rounded-xl shadow-md"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setForm({ ...form, image: "" }); }}
                className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <PlusCircle className="mx-auto text-gray-300" size={40} />
              <p className="text-gray-400 text-sm">Click to upload banner</p>
            </div>
          )}
          <input type="file" id="imageInput" accept="image/*" className="hidden" onChange={handleImageSelect} />
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {["banner", "duration", "timing", "language"].map((field) => (
          <div key={field} className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="text-[10px] uppercase text-gray-400 font-black mb-1">{field === 'banner' ? 'Start Date' : field}</p>
            <EditableField
              value={form[field as keyof CourseForm] as string}
              onChange={(val) => handleFieldChange(field as keyof CourseForm, val)}
              placeholder="..."
              className="text-lg font-semibold"
            />
          </div>
        ))}
      </div>

      {/* Modules */}
      <div className="space-y-4 pt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Curriculum</h2>
          <Button onClick={addModule} variant="outline" className="border-[#0096FF] text-[#0096FF]">
            <PlusCircle size={18} className="mr-2" /> Add Module
          </Button>
        </div>
        <div className="grid gap-4">
          {form.modules.map((mod, i) => (
            <div key={i} className="p-5 border rounded-2xl bg-gray-50 flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full"><Input className="bg-white" placeholder="Title" value={mod.title} onChange={(e) => handleModuleChange(i, "title", e.target.value)} /></div>
              <div className="flex-1 w-full"><Input className="bg-white" placeholder="Zoom" value={mod.zoomLink} onChange={(e) => handleModuleChange(i, "zoomLink", e.target.value)} /></div>
              <div className="flex-1 w-full"><Input className="bg-white" placeholder="Drive" value={mod.downloadLink} onChange={(e) => handleModuleChange(i, "downloadLink", e.target.value)} /></div>
              {form.modules.length > 1 && (
                <Button variant="ghost" onClick={() => removeModule(i)} className="text-red-500 hover:bg-red-50"><Trash2 size={20} /></Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="space-y-4 pt-10 border-t">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-[#0096FF]" size={24} /> Enrolled Students ({form.students.length})
        </h2>
        <div className="border rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {form.students.map((s, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{s.user?.userName || "N/A"}</TableCell>
                  <TableCell className="text-gray-500">{s.user?.email || "N/A"}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">
                      {s.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {form.students.length === 0 && (
                <TableRow><TableCell colSpan={3} className="text-center py-10 text-gray-400 italic">No students enrolled yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default UpdateCoursePage;