"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Unauthorized() {
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-6">
          Unauthorized Access
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        
        <Link
          href={session?.user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
} 