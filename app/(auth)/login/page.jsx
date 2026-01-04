"use client";

import { useSelector } from "react-redux";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CommonForm from "@/components/common/form";
import { loginFormControls } from "@/config/formControls";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import { loginUser, loginUserByGoogle } from "@/redux/slices/auth/authSlice";

const initialState = {
  email: "",
  password: "",
};

const LoginPage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  console.log("Login page:", user, isAuthenticated);
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log(formData);
      
      const action = await dispatch(loginUser(formData));
      const data = action.payload;

      if (data.success) {
        // alert(data.message || "Login Successful");x

        if (data.user?.role === "admin") {
          router.push("/admin/");
        } else {
          router.push("/");
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse?.credential) {
        alert("Google login failed");
        return;
      }

      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        userName: decoded.name,
        email: decoded.email,
        googleId: decoded.sub,
        profilePicture: decoded.picture,
      };

      const action = await dispatch(loginUserByGoogle(userData));
      const data = action.payload;

      if (data.success) {
        alert(data.message || "Google Login Successful");
        router.push("/shop/home");
      } else {
        alert(data.message || "Google login failed");
      }
    } catch (error) {
      console.error(error);
      alert("Google login failed");
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Sign In to Your Account
        </h1>
      </div>

      <CommonForm
        formControls={loginFormControls}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        buttonText="Sign In"
      />

      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => alert("Google Login Failed")}
      />

      <p className="mt-2 text-center text-sm">
        Don&apos;t have an account?
        <Link
          href="/auth/register"
          className="ml-1 font-medium text-primary hover:underline"
        >
          Register
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;
