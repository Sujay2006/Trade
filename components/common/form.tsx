"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/* =======================
   Types
======================= */

type Option = {
  id: string;
  label: string;
};

type FormControl = {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  id?: string;
  componentType: "input" | "select" | "textarea" | "tags";
  options?: Option[];
};

type FormDataType = Record<string, unknown>;

interface Props {
  formControls: FormControl[];
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  buttonText?: string;
  isBtnDisabled?: boolean;
}

/* =======================
   Component
======================= */

const CommonForm: React.FC<Props> = ({
  formControls,
  formData,
  setFormData,
  onSubmit,
  buttonText = "Submit",
  isBtnDisabled = false
}) => {
  function renderInputByComponentType(control: FormControl) {
    const value = (formData[control.name] as string) || "";

    switch (control.componentType) {
      case "input":
        return (
          <Input
            name={control.name}
            placeholder={control.placeholder}
            id={control.name}
            type={control.type}
            value={value}
            onChange={(e) =>
              setFormData({
                ...formData,
                [control.name]: e.target.value
              })
            }
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(val) =>
              setFormData({
                ...formData,
                [control.name]: val
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={control.label} />
            </SelectTrigger>
            <SelectContent>
              {control.options?.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "textarea":
        return (
          <Textarea
            name={control.name}
            placeholder={control.placeholder}
            id={control.name}
            value={value}
            onChange={(e) =>
              setFormData({
                ...formData,
                [control.name]: e.target.value
              })
            }
          />
        );

      case "tags": {
        const inputKey = `__${control.name}_input`;
        const inputValue = (formData[inputKey] as string) || "";
        const tags = (formData[control.name] as string[]) || [];

        return (
          <div className="w-full">
            <Input
              placeholder={`Add ${control.label}`}
              value={inputValue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [inputKey]: e.target.value
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  const newTag = e.currentTarget.value.trim();

                  if (!tags.includes(newTag)) {
                    setFormData({
                      ...formData,
                      [control.name]: [...tags, newTag],
                      [inputKey]: ""
                    });
                  }
                }
              }}
            />

            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-200 rounded-full"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...tags];
                      updated.splice(idx, 1);
                      setFormData({
                        ...formData,
                        [control.name]: updated
                      });
                    }}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-3">
        {formControls.map((control) => (
          <div className="grid w-full gap-1.5" key={control.name}>
            <Label className="mb-1">{control.label}</Label>
            {renderInputByComponentType(control)}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isBtnDisabled} className="mt-2 w-full">
        {buttonText}
      </Button>
    </form>
  );
};

export default CommonForm;
