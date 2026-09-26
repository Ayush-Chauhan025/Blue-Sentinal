"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { SignIn, SignUp } from "./actions";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSignIn(formData: FormData) {
    setIsPending(true);
    setError(null);
    const res = await SignIn(formData);
    if (res?.error) {
      setError(res.error);
    }
    setIsPending(false);
  }

  async function handleSignUp(formData: FormData) {
    setIsPending(true);
    setError(null);
    const res = await SignUp(formData);
    if (res?.error) {
      setError(res.error);
    }
    setIsPending(false);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-black">
      <div className="font-extrabold text-4xl p-4 text-blue-600">
        Welcome
      </div>
      <div className="w-full max-w-md"> 
        
        {/* Error Display UI */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-lg mb-4 text-center transition-all">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-5">

          {/* Email */}
          <div className="relative group">
            <label
              htmlFor="email"
              className="absolute -top-2.5 left-4 bg-white px-2 text-sm font-bold text-blue-600
              opacity-0 transition-transform duration-200 group-focus-within:opacity-100"
            >
              Email
            </label>
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Enter Your Email/Phone"
              required
              className="w-full h-14 rounded-lg border border-gray-400 px-4 text-base outline-none 
              transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <label
              htmlFor="password"
              className=" absolute -top-2.5 left-4 bg-white px-2 text-sm font-bold text-blue-600
              opacity-0 transition-transform duration-200 group-focus-within:opacity-100"
            >
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              required
              className=" w-full h-14 rounded-lg border border-gray-400 px-4 pr-12 text-base 
              outline-none transition focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-blue-600 transition "
            >
              {showPassword ? (
                <EyeOff size={25} />
              ) : (
                <Eye size={25} />
              )}
            </button>
          </div>

          {/* SignIn */}
          <button
            formAction={handleSignIn}
            disabled={isPending}
            className=" bg-blue-600 text-white rounded-md px-4 py-3 transition hover:bg-blue-700 active:scale-[0.99] disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Processing..." : "SignIn"}
          </button>

          {/* SignUp */}
          <button
            formAction={handleSignUp} 
            disabled={isPending}
            className=" text-black border border-gray-300 rounded-md px-4 py-3 font-semibold transition hover:bg-gray-100 active:scale-[0.99] disabled:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            SignUp
          </button>
        </form>
      </div>
    </div>
  );
}