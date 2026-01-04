import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Adjust this URL based on your folder structure (e.g., /api/admin/blog)
const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/admin/blog";

// 🧩 Thunks
export const createBlog = createAsyncThunk(
  "blog/create",
  async (formData: FormData) => {
    const res = await axios.post(`${API_URL}/create`, formData);

    // normalize response
    return res.data.blog ?? res.data;
  }
);


export const getBlogs = createAsyncThunk("blog/getBlogs", async () => {
  const res = await axios.get(`${API_URL}/get`);
  const data = res.data;
  console.log(res.data);
  // Normalize to return array
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.blogs)) return data.blogs;
  return data;
});

export const updateBlog = createAsyncThunk(
  "blog/update",
  async ({ id, data }: { id: string; data: FormData }) => {
    const res = await axios.put(`${API_URL}/${id}`, data);

    // normalize response
    return res.data.blog ?? res.data;
  }
);

export const deleteBlog = createAsyncThunk(
  "blog/delete",
  async (id: string) => {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  }
);


// 🧩 Slice
const blogSlice = createSlice({
  name: "blog",
  initialState: {
    blogs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🟢 Create
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) state.blogs.push(action.payload);
      })
      // 🟢 Get All
      .addCase(getBlogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBlogs.fulfilled, (state, action) => {
        console.log("Payload received in Slice:", action.payload); // DEBUG HERE
        state.loading = false;
      state.blogs = Array.isArray(action.payload) ? action.payload : [];
      })
          // 🟢 Update
          .addCase(updateBlog.fulfilled, (state, action) => {
      if (!action.payload) return;

      const index = state.blogs.findIndex(
        (b: any) => b._id === action.payload._id
      );

      if (index !== -1) {
        state.blogs[index] = action.payload;
      } else {
        // if blog not in list yet (edge case)
        state.blogs.push(action.payload);
      }
    })
      // 🟢 Delete
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.blogs = state.blogs.filter((b: any) => b._id !== action.payload);
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

export default blogSlice.reducer;