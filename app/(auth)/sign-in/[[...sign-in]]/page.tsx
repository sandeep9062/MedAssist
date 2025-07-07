"use client";

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 via-blue-100 to-teal-100">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-green-200">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-gradient-to-br from-green-400 to-blue-500 p-3 rounded-full">
            <img
              src="/medical-logo.png"
              alt="MedAssist AI"
              className="h-12 w-12 rounded-full"
            />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-green-700">
            Welcome to MedAssist AI
          </h1>
          <p className="text-sm text-gray-600 text-center">
            Your personal AI medical assistant. Sign in to continue.
          </p>
        </div>
        <SignIn/>
      </div>
    </div>
  );
}
