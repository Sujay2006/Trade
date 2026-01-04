"use client";

import { useSelector } from "react-redux";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Course() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  console.log(user, isAuthenticated);
  
  return (
    <div>
      <Button>Course</Button>
    </div>
  );
}
