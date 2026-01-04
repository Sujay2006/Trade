import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/admin/course";

// 🧩 Thunks
export const createCourse = createAsyncThunk("course/create", async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
});

export const getCourses = createAsyncThunk("course/getCourses", async () => {
  const res = await axios.get(API_URL);
  // ✅ Normalize to always return an array
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.courses)) return data.courses;
  return []; // fallback
});

export const updateCourse = createAsyncThunk("course/update", async ({ id, data }) => {
  const res = await axios.put(`${API_URL}/${id}`, data);
  return res.data;
});
export const getCourseById = createAsyncThunk("course/getCourseById", async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
});

export const deleteCourse = createAsyncThunk("course/delete", async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

// 🧩 Slice
const courseSlice = createSlice({
  name: "course",
  initialState: {
    courses: [],
    course: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🟢 Create
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.courses.push(action.payload);
      })
      .addCase(getCourseById.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.course = action.payload;
      })
      // 🟢 Get All
      .addCase(getCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.loading = false;
        // ✅ Guarantee array
        state.courses = Array.isArray(action.payload) ? action.payload : [];
      })
      // 🟢 Update
      .addCase(updateCourse.fulfilled, (state, action) => {
        const index = state.courses.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.courses[index] = action.payload;
      })
      // 🟢 Delete
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.courses = state.courses.filter((c) => c._id !== action.payload);
      })
      // 🟠 Error
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        }
      );
  },
});

export default courseSlice.reducer;
