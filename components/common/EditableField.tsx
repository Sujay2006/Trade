"use client";
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  type?: "input" | "textarea";
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string; // ✅ ADDED THIS LINE
}

export function EditableField({
  value,
  onChange,
  type = "input",
  placeholder,
  size = "md",
  className = "",
  label = "", // This now works because it's in the interface above
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && ref.current) ref.current.focus();
  }, [isEditing]);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-3xl font-bold",
  };

  return (
    <div className={`${className}`}>
      {isEditing ? (
        type === "textarea" ? (
          <Textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            placeholder={placeholder}
            className={`w-full border border-input px-3 py-2 ${sizeClasses[size]} ${className}`}
          />
        ) : (
          <Input
            ref={ref as React.RefObject<HTMLInputElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setIsEditing(false)}
            placeholder={placeholder}
            className={`px-3 py-2 ${sizeClasses[size]} ${className}`}
          />
        )
      ) : (
        <div
          className={`cursor-text ${sizeClasses[size]} ${className}`}
          onClick={() => setIsEditing(true)}
        >
          {value ? (
            <div className="">
              <div className={`${className}`}>{value}</div>
              {label && (
                <div className="text-gray-400 text-sm font-normal">{label}</div>
              )}
            </div>
          ) : (
            <div className="">
                <div className={`${className} text-gray-400 italic`}>
                    {placeholder || "Click to edit"}
                </div>
                {label && (
                    <div className="text-gray-400 text-sm font-normal">{label}</div>
                )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}