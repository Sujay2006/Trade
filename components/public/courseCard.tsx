"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export interface CourseCardProps {
  _id: string;
  title: string;
  description?: string;
  image?: string;
  price?: number;
  salePrice?: number;
  duration?: string;
  language?: string;
}

export default function CourseCard({
  _id,
  title,
  description,
  image,
  price,
  salePrice,
  duration,
  language,
}: CourseCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/course/${_id}`)}
      className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
    >
      {/* Image */}
      <div className="relative w-full h-40">
        <Image
          src={image || "/placeholder.png"}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>

        <p className="text-sm text-gray-600 line-clamp-2">
          {description || "No description available"}
        </p>

        <div className="flex justify-between text-sm text-gray-500">
          <span>{language || "—"}</span>
          <span>{duration || "—"}</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          {salePrice ? (
            <>
              <span className="text-lg font-bold text-[#0096FF]">
                ₹{salePrice}
              </span>
              <span className="text-sm line-through text-gray-400">
                ₹{price}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-[#0096FF]">
              ₹{price ?? "Free"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
