import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

/* =========================
   Types
========================= */

// ✅ Replaced 'any' with 'unknown' or defined keys to satisfy linter
interface UserData {
  id: string;
  email: string;
  userName: string;
  role: string;
  profilePicture?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

/* =========================
   Async Thunks (Using Relative Paths)
========================= */

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData: unknown) => {
    const response = await axios.post(`/api/auth/register`, formData, {
      withCredentials: true,
    });
    return response.data;
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData: unknown) => {
    const response = await axios.post(`/api/auth/login`, formData, {
      withCredentials: true,
    });
    return response.data;
  }
);

export const logOutUser = createAsyncThunk("auth/logout", async () => {
  const response = await axios.post(`/api/auth/logout`, {}, { withCredentials: true });
  return response.data;
});

export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
  const response = await axios.get(`/api/auth/check-auth`, {
    withCredentials: true,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
  return response.data;
});

export const registerUserByGoogle = createAsyncThunk(
  "auth/google-register",
  async (formData: unknown) => {
    const response = await axios.post(`/api/auth/google-register`, formData, {
      withCredentials: true,
    });
    return response.data;
  }
);

export const loginUserByGoogle = createAsyncThunk(
  "auth/google-login",
  async (formData: unknown) => {
    const response = await axios.post(`/api/auth/google-login`, formData, {
      withCredentials: true,
    });
    return response.data;
  }
);

/* =========================
   Slice
========================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ✅ Replaced Record<string, any> with UserData | null
    setUser: (state, action: PayloadAction<UserData | null>) => {
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
        state.isLoading = false;
        const success = action.payload?.success;
        state.user = success ? (action.payload.user as UserData) : null;
        state.isAuthenticated = !!success;
      })
      .addCase(registerUserByGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        const success = action.payload?.success;
        state.user = success ? (action.payload.user as UserData) : null;
        state.isAuthenticated = !!success;
      })
      .addCase(loginUserByGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        const success = action.payload?.success;
        state.user = success ? (action.payload.user as UserData) : null;
        state.isAuthenticated = !!success;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        const success = action.payload?.success;
        state.user = success ? (action.payload.user as UserData) : null;
        state.isAuthenticated = !!success;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
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