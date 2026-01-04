import { createSlice, createAsyncThunk, PayloadAction, SerializedError } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `/api/admin/course`;
// const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/course`;

/* =======================
    Types
   ======================= */
export interface Module {
  title: string;
  zoomLink: string;
  downloadLink: string;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  salePrice: string;
  duration?: string;
  timing?: string;
  language?: string;
  seat?: string;
  whatsAppLink?: string;
  telegramLink?: string;
  modules: Module[];
  [key: string]: string | Module[] | undefined; 
}

export interface CourseState {
  courses: Course[];
  course: Course | null;
  loading: boolean;
  error: string | null | undefined;
}


/* =======================
    Thunks
   ======================= */

export const createCourse = createAsyncThunk(
  "course/create",
  async (data: FormData) => {
    const res = await axios.post(API_URL, data);
    return res.data;
  }
);

export const getCourses = createAsyncThunk("course/getCourses", async () => {
  const res = await axios.get(API_URL);
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.courses)) return data.courses;
  return [] as Course[];
});

export const updateCourse = createAsyncThunk(
  "course/update",
  async ({ id, data }: { id: string; data: FormData }) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
  }
);

export const getCourseById = createAsyncThunk(
  "course/getCourseById",
  async ({ id }: { id: string }) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  }
);

export const deleteCourse = createAsyncThunk(
  "course/delete",
  async (id: string) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);

/* =======================
    Slice
   ======================= */

const initialState: CourseState = {
  courses: [],
  course: null,
  loading: false,
  error: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        if (action.payload) state.courses.push(action.payload);
      })
      // Get By ID
      .addCase(getCourseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCourseById.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        state.course = action.payload;
      })
      // Get All
      .addCase(getCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.courses = action.payload;
      })
      // Update
      .addCase(updateCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        const index = state.courses.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.courses[index] = action.payload;
        state.course = action.payload;
      })
      // Delete
      .addCase(deleteCourse.fulfilled, (state, action: PayloadAction<string>) => {
        state.courses = state.courses.filter((c) => c._id !== action.payload);
      })
      /* =======================
          Error Handling Matcher
         ======================= */
      .addMatcher(
        (action): action is PayloadAction<never, string, never, SerializedError> => 
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.error?.message || "An unexpected error occurred";
        }
      );
  },
});

export default courseSlice.reducer;