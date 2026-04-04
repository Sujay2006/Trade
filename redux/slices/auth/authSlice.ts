import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

/* =========================
    Types
========================= */

interface UserData {
  id: string;
  email: string;
  userName: string;
  role: string;
  profilePicture?: string;
  phone?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true, // Starts as true to prevent flicker during checkAuth
  user: null,
};

/* =========================
    Async Thunks
========================= */

// Standard Email/Password Register
export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData: unknown) => {
    const response = await axios.post(`/api/auth/register`, formData, {
      withCredentials: true,
    });
    return response.data;
  }
);

// Standard Email/Password Login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData: unknown) => {
    const response = await axios.post(`/api/auth/login`, formData, {
      withCredentials: true,
    });
    return response.data;
  }
);

// New Combined Google Auth (Handles both Register & Login)
export const loginUserByGoogle = createAsyncThunk(
  "auth/google-auth",
  async (formData: unknown) => {
    const response = await axios.post(`/api/auth/google-auth`, formData, {
      withCredentials: true,
    });
    return response.data;
  }
);

export const logOutUser = createAsyncThunk("auth/logout", async () => {
  const response = await axios.post(`/api/auth/logout`, {}, { withCredentials: true });
  return response.data;
});

// export const checkAuth = createAsyncThunk("auth/checkAuth", async () => {
//   const response = await axios.get(`/api/auth/check-auth`, {
//     withCredentials: true,
//     headers: {
//       "Cache-Control": "no-store",
//     },
//   });
//   return response.data;
// });

/* =========================
    Slice
========================= */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // REGISTER: Now handles immediate login
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const success = action.payload?.success;
        state.user = success ? (action.payload.user as UserData) : null;
        state.isAuthenticated = !!success;
      })
      // LOGIN
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const success = action.payload?.success;
        state.user = success ? (action.payload.user as UserData) : null;
        state.isAuthenticated = !!success;
      })
      // GOOGLE AUTH (Combined Register/Login)
      .addCase(loginUserByGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        const success = action.payload?.success;
        state.user = success ? (action.payload.user as UserData) : null;
        state.isAuthenticated = !!success;
      })
      // CHECK AUTH
      // .addCase(checkAuth.pending, (state) => {
      //   state.isLoading = true;
      // })
      // .addCase(checkAuth.fulfilled, (state, action) => {
      //   state.isLoading = false;
      //   const success = action.payload?.success;
      //   state.user = success ? (action.payload.user as UserData) : null;
      //   state.isAuthenticated = !!success;
      // })
      // .addCase(checkAuth.rejected, (state) => {
      //   state.isLoading = false;
      //   state.user = null;
      //   state.isAuthenticated = false;
      // })
      // LOGOUT
      .addCase(logOutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;