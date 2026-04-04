"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CommonForm from "@/components/common/form";
import { registerFormControls } from "@/config/formControls";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { loginUserByGoogle, registerUser } from "@/redux/slices/auth/authSlice";
import { AppDispatch } from "@/redux/store";

// 1. Added [key: string]: unknown to provide the missing Index Signature
interface RegisterFormData {
  userName: string;
  email: string;
  phone: string;
  password: string;
  [key: string]: unknown; 
}

interface GoogleToken {
  name: string;
  email: string;
  sub: string;
  picture: string;
}

const initialState: RegisterFormData = {
  userName: "",
  email: "",
  phone: "",
  password: "",
};

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterFormData>(initialState);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const action = await dispatch(registerUser(formData));
      if (action.payload?.success) {
        router.push("/");
      } else {
        alert(action.payload?.message || "Registration failed");
      }
    } catch {
      // Removed (error) to fix unused-vars lint error
      alert("Something went wrong during registration");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse?.credential) return;

      const decoded = jwtDecode<GoogleToken>(credentialResponse.credential);
      
      const userData = {
        userName: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
        profilePicture: decoded.picture,
      };

      const action = await dispatch(loginUserByGoogle(userData));
      if (action.payload?.success) {
        router.push("/");
      }
    } catch (err) {
      // Using err variable or omitting it fixes unused-vars
      console.error("Google Auth Error:", err);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h1>
        <p className="text-gray-500 text-sm font-medium">Start your trading journey today</p>
      </div>

      {/* Passing the interface here works now that it has an index signature */}
      <CommonForm<RegisterFormData>
        formControls={registerFormControls}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        buttonText="Sign Up"
      />

      <div className="relative flex items-center py-2">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase">Or join with</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert("Google Sign Up Failed")}
          theme="outline"
          shape="pill"
          width="100%"
        />
      </div>

      <p className="mt-4 text-center text-sm text-gray-600 font-medium">
        Already have an account?
        <Link href="/login" className="ml-1 text-[#0096FF] font-bold hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;