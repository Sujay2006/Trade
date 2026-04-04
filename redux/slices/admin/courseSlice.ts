import { 
  createSlice, 
  createAsyncThunk, 
  PayloadAction, 
  isPending, 
  isRejected 
} from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `/api/admin/course`;

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
    createdAt?: string; 
  whatsAppLink?: string;
  telegramLink?: string;
  modules: Module[];
  [key: string]: unknown;
}

export interface CourseState {
  courses: Course[];
  course: Course | null;
  loading: boolean;
  error: string | null;
}

/* =======================
    Thunks
   ======================= */

export const createCourse = createAsyncThunk(
  "course/create",
  async (data: Record<string, unknown>, { rejectWithValue }) => {
    try {
      const res = await axios.post(API_URL, data);
      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to create course"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const getCourses = createAsyncThunk(
  "course/getCourses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(API_URL);
      const data = res.data;

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.courses)) return data.courses;

      return [] as Course[];
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch courses"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const getCourseById = createAsyncThunk(
  "course/getCourseById",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch course details"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

/* =======================
   FIXED UPDATE COURSE
======================= */

export const updateCourse = createAsyncThunk(
  "course/update",
  async (
    { id, data }: { id: string; data: Record<string, unknown> },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, data);
      return res.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to update course"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

export const deleteCourse = createAsyncThunk(
  "course/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to delete course"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
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
  reducers: {
    clearCourse: (state) => {
      state.course = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.courses = action.payload;
      })

      .addCase(
        getCourseById.fulfilled,
        (state, action: PayloadAction<Course>) => {
          state.loading = false;
          state.course = action.payload;
        }
      )

      .addCase(
        createCourse.fulfilled,
        (state, action: PayloadAction<Course>) => {
          state.loading = false;
          if (action.payload) state.courses.push(action.payload);
        }
      )

      .addCase(
        updateCourse.fulfilled,
        (state, action: PayloadAction<Course>) => {
          state.loading = false;

          const index = state.courses.findIndex(
            (c) => c._id === action.payload._id
          );

          if (index !== -1) {
            state.courses[index] = action.payload;
          }

          state.course = action.payload;
        }
      )

      .addCase(
        deleteCourse.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.courses = state.courses.filter(
            (c) => c._id !== action.payload
          );
        }
      )

      /* Matchers */
      .addMatcher(
        isPending(
          getCourses,
          getCourseById,
          createCourse,
          updateCourse,
          deleteCourse
        ),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addMatcher(
        isRejected(
          getCourses,
          getCourseById,
          createCourse,
          updateCourse,
          deleteCourse
        ),
        (state, action) => {
          state.loading = false;
          state.error =
            (action.payload as string) ||
            action.error.message ||
            "An unexpected error occurred";
        }
      );
  },
});

export const { clearCourse } = courseSlice.actions;
export default courseSlice.reducer;