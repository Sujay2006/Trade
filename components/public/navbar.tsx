"use client";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { loginUserByGoogle } from "@/redux/slices/auth/authSlice";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import { Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type GoogleJwtPayload = {
  name: string;
  email: string;
  sub: string;
  picture: string;
};

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      alert("Google login failed");
      return;
    }

    const decoded = jwtDecode<GoogleJwtPayload>(credentialResponse.credential);

    const userData = {
      userName: decoded.name,
      email: decoded.email,
      googleId: decoded.sub,
      profilePicture: decoded.picture,
    };

    dispatch(loginUserByGoogle(userData));
  };

  return (
    <nav className="w-full bg-white shadow-md px-4 py-2 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center">
        <Image src="/next.svg" alt="Logo" width={120} height={40} />
      </div>

      {/* Middle: Search Bar */}
      <div className="hidden md:flex flex-1 mx-4 max-w-lg">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search..."
            className="w-full border rounded-full px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 h-5 w-5" />
        </div>
      </div>

      {/* Right: Login */}
      <div className="flex items-center space-x-2">
        {!isAuthenticated ? (
          !showGoogleLogin ? (
            <button
              onClick={() => setShowGoogleLogin(true)}
              className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition"
            >
              Login
            </button>
          ) : (
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert("Google Login Failed")} />
          )
        ) : (
          <div className="flex items-center space-x-2">
            <Image
              src={user?.profilePicture || "/default-avatar.png"}
              alt="User"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-medium">{user?.userName}</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
