"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {session?.user?.name}!</h2>
          <p className="text-gray-600">
            This is your admin dashboard. From here you can manage users, connections, bills, and complaints.
          </p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/users" className="border p-4 rounded-lg hover:bg-gray-50">
              <h3 className="font-medium text-lg mb-2">Users</h3>
              <p className="text-sm text-gray-500">Manage all system users</p>
            </Link>
            
            <Link href="/admin/connections" className="border p-4 rounded-lg hover:bg-gray-50">
              <h3 className="font-medium text-lg mb-2">Connections</h3>
              <p className="text-sm text-gray-500">Manage electricity connections</p>
            </Link>
            
            <Link href="/admin/complaints" className="border p-4 rounded-lg hover:bg-gray-50">
              <h3 className="font-medium text-lg mb-2">Complaints</h3>
              <p className="text-sm text-gray-500">Manage and resolve user complaints</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 