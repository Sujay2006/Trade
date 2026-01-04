import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL + "/api/admin/blog";

/* =======================
    Types
   ======================= */
export interface Blog {
  _id: string;
  title: string;
  content: string;
  image: string;
  category?: string;
  createdAt?: string;
  [key: string]: any; 
}

interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null | undefined;
}

/* =======================
    Thunks
   ======================= */

export const createBlog = createAsyncThunk(
  "blog/create",
  async (formData: FormData) => {
    const res = await axios.post(`${API_URL}/create`, formData);
    return res.data.blog ?? res.data;
  }
);

export const getBlogs = createAsyncThunk("blog/getBlogs", async () => {
  const res = await axios.get(`${API_URL}/get`);
  const data = res.data;
  
  // Normalize response to return array
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.blogs)) return data.blogs;
  return []; 
});

// Added this to prevent the "Argument of type {id} is not assignable" error in Edit pages
export const getBlogById = createAsyncThunk(
  "blog/getBlogById",
  async ({ id }: { id: string }) => {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data.blog ?? res.data;
  }
);

export const updateBlog = createAsyncThunk(
  "blog/update",
  async ({ id, data }: { id: string; data: FormData }) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
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

/* =======================
    Slice
   ======================= */

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
};

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create
      .addCase(createBlog.pending, (state) => {
        state.loading = true;
      })
      .addCase(createBlog.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.loading = false;
        if (action.payload) state.blogs.push(action.payload);
      })
      // Get All
      .addCase(getBlogs.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBlogs.fulfilled, (state, action: PayloadAction<Blog[]>) => {
        state.loading = false;
        state.blogs = Array.isArray(action.payload) ? action.payload : [];
      })
      // Get By ID
      .addCase(getBlogById.fulfilled, (state, action: PayloadAction<Blog>) => {
        state.currentBlog = action.payload;
      })
      // Update
      .addCase(updateBlog.fulfilled, (state, action: PayloadAction<Blog>) => {
        if (!action.payload) return;
        const index = state.blogs.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        state.currentBlog = action.payload;
      })
      // Delete
      .addCase(deleteBlog.fulfilled, (state, action: PayloadAction<string>) => {
        state.blogs = state.blogs.filter((b) => b._id !== action.payload);
      })
      // Error
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.error = action.error.message;
        }
      );
  },
});

export default blogSlice.reducer;