"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// ✅ Import the Course type from your slice to prevent "Two different types" error
import { getCourses, deleteCourse, Course } from "@/redux/slices/admin/courseSlice";
import { Edit, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";

export default function AdminCourse() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { courses, loading } = useSelector(
    (state: RootState) => state.course
  );

  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    dispatch(getCourses());
  }, [dispatch]);

  /* =======================
      Derived Data
     ======================= */

  // ✅ Use the imported Course type here
  const filteredCourses: Course[] = Array.isArray(courses)
    ? courses.filter((course: Course) =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const averagePrice =
    Array.isArray(courses) && courses.length > 0
      ? (
          courses.reduce(
            (sum: number, course: Course) =>
              // ✅ Cast to Number in case the API returns a string
              sum + (Number(course.price) || 0),
            0
          ) / courses.length
        ).toFixed(0)
      : null;

  const uniqueLanguages =
    Array.isArray(courses)
      ? new Set(courses.map((c: Course) => c.language)).size
      : 0;

  return (
    <div className="space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-1 font-semibold">
            Course Management
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your trading courses and track their performance
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/course/new")}
          className="bg-black text-white rounded-xl px-4 py-2 w-full sm:w-auto"
        >
          + New Course
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {courses.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active courses in your academy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {averagePrice ? `₹${averagePrice}` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average price of your listed courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Languages Offered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {uniqueLanguages}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique languages across all courses
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle>Courses</CardTitle>
              <CardDescription>
                Manage all your uploaded courses
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-10 text-center text-gray-500">
                Loading courses...
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                No courses found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.description?.slice(0, 40) || "—"}
                        </div>
                      </TableCell>
                      <TableCell>{course.language || "—"}</TableCell>
                      <TableCell>{course.duration || "—"}</TableCell>
                      <TableCell>
                        ₹{course.price ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/admin/course/${course._id}`)
                            }
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              dispatch(deleteCourse(course._id))
                            }
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}