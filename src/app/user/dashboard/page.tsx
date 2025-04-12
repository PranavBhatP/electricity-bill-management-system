"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type Connection = {
  id: number;
  meter_no: string;
  tariff_type: string;
  tariff_rate: string;
};

export default function UserDashboard() {
  const { data: session } = useSession();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchConnections() {
      try {
        setLoading(true);
        const response = await fetch("/api/user/connections");
        
        if (!response.ok) {
          throw new Error("Failed to fetch connections");
        }
        
        const data = await response.json();
        setConnections(data);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching connections");
      } finally {
        setLoading(false);
      }
    }
    
    if (session?.user) {
      fetchConnections();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">User Dashboard</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, {session?.user?.name}!</h2>
          <p className="text-gray-600 mb-6">
            This is your dashboard. From here you can view your electricity connections,
            manage bills, make payments, and submit complaints.
          </p>
          
          <h3 className="text-lg font-medium mb-3">My Connections</h3>
          
          {error && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {loading ? (
            <p className="text-gray-500">Loading connections...</p>
          ) : connections.length === 0 ? (
            <p className="text-gray-500">You don't have any connections yet. Please contact an administrator to set up a connection.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((connection) => (
                <div key={connection.id} className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-blue-600">Meter No: {connection.meter_no}</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Tariff Type:</span> {connection.tariff_type}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Rate:</span> ${connection.tariff_rate} per unit
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200">
                      View Bills
                    </button>
                    <button className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200">
                      Usage History
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-medium text-lg mb-3">Recent Bills</h3>
            <p className="text-sm text-gray-500">
              You don't have any recent bills.
            </p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-medium text-lg mb-3">Submit a Complaint</h3>
            <p className="text-sm text-gray-500 mb-4">
              Having an issue with your connection or bill? Submit a complaint and our team will assist you.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              New Complaint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 