import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: Record<string, any> | null;
} 
const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null as null | Record<string, any>,
};

// Standard Registration
export const registerUser = createAsyncThunk("auth/register", async (formData: any) => {
  const response = await axios.post(`${API_URL}/api/auth/register`, formData, {
    withCredentials: true,
  });
  return response.data;
});

// Standard Login
export const loginUser = createAsyncThunk("auth/login", async (formData: any) => {
  console.log(formData);
  
  const response = await axios.post(`/api/auth/login`, formData, {
    withCredentials: true,
  });
  console.log(response.data);
  
  return response.data;
});

// Logout
export const logOutUser = createAsyncThunk("auth/logout", async () => {
  console.log("coming logout");
  
  const response = await axios.post(`/api/auth/logout`, { withCredentials: true });
  return response.data;
});

// Check Auth
export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  const response = await axios.get(`/api/auth/check-auth`, {
    withCredentials: true,
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" },
  });
  return response.data;
});

// Google Registration
export const registerUserByGoogle = createAsyncThunk("auth/google-register", async (formData: any) => {
  const response = await axios.post(`${API_URL}/api/auth/google-register`, formData, {
    withCredentials: true,
  });
  return response.data;
});

// Google Login
export const loginUserByGoogle = createAsyncThunk("auth/google-login", async (formData: any) => {
  const response = await axios.post(`${API_URL}/api/auth/google-login`, formData, {
    withCredentials: true,
  });
  return response.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("Login payload:", action.payload); // Debug
  state.isLoading = false;
  state.user = action.payload?.success ? action.payload.user : null;
  state.isAuthenticated = !!action.payload?.success;
      })
      .addCase(registerUserByGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(loginUserByGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.success ? action.payload.user : null;
        state.isAuthenticated = action.payload.success;
      })
      .addCase(logOutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
