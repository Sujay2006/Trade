"use client";

import { useState } from "react";
import { useDispatch} from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CommonForm from "@/components/common/form";
import { loginFormControls } from "@/config/formControls";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { loginUser, loginUserByGoogle } from "@/redux/slices/auth/authSlice";
import type { AppDispatch } from "@/redux/store";

/* =======================
   Types & Interfaces
======================= */

// Added Index Signature [key: string]: unknown to satisfy CommonForm constraint
interface LoginFormData {
  email: string;
  password: string;
  [key: string]: unknown; 
}

interface GoogleToken {
  name: string;
  email: string;
  sub: string;
  picture: string;
}

const initialState: LoginFormData = {
  email: "",
  password: "",
};

const LoginPage = () => {
  // const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [formData, setFormData] = useState<LoginFormData>(initialState);
  
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const action = await dispatch(loginUser(formData));
      const data = action.payload;

      if (data?.success) {
        if (data.user?.role === "admin") {
          router.push("/admin/");
        } else {
          router.push("/");
        }
      } else {
        alert(data?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong during login");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        alert("Google login failed");
        return;
      }

      const decoded = jwtDecode<GoogleToken>(credentialResponse.credential);
      const userData = {
        userName: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
        profilePicture: decoded.picture,
      };

      const action = await dispatch(loginUserByGoogle(userData));
      const data = action.payload;

      if (data?.success) {
        alert(data.message || "Google Login Successful");
        // Adjusted to / if this is a general app, or keep /shop/home if that is your path
        router.push("/"); 
      } else {
        alert(data?.message || "Google login failed");
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      alert("Google login failed");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-gray-500 text-sm font-medium">Please enter your details</p>
      </div>

      <CommonForm<LoginFormData>
        formControls={loginFormControls}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        buttonText="Sign In"
      />

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase">Or</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert("Google Login Failed")}
          theme="outline"
          shape="pill"
          width="100%"
        />
      </div>

      <p className="mt-4 text-center text-sm text-gray-600 font-medium">
        Don&apos;t have an account?
        <Link
          href="/register"
          className="ml-1 text-[#0096FF] font-bold hover:underline"
        >
          Register here
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;