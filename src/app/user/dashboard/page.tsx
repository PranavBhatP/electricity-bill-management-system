"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

type Connection = {
  id: number;
  meterNo: string;
  tariffType: string;
  tariffRate: string;
};

type Payment = {
  id: number;
  amount: string;
  status: string;
};

type Bill = {
  id: number;
  amount: string;
  dueDate: string;
  connection: Connection;
  payments: Payment[];
};

export default function UserDashboard() {
  const { data: session } = useSession();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user) {
      Promise.all([
        fetchConnections(),
        fetchBills()
      ]).finally(() => setLoading(false));
    }
  }, [session]);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/user/connections");
      
      if (!response.ok) {
        throw new Error("Failed to fetch connections");
      }
      
      const data = await response.json();
      setConnections(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching connections");
    }
  };

  const fetchBills = async () => {
    try {
      const response = await fetch("/api/user/bills");
      
      if (!response.ok) {
        throw new Error("Failed to fetch bills");
      }
      
      const data = await response.json();
      setBills(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching bills");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  // Get unpaid bills (no payments or all payments failed)
  const unpaidBills = bills.filter(bill => 
    bill.payments.length === 0 || 
    bill.payments.every(payment => payment.status === 'failed')
  );

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
                  <h4 className="font-medium text-blue-600">Meter No: {connection?.meterNo}</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Tariff Type:</span> {connection?.tariffType}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Rate:</span> ${connection?.tariffRate} per unit
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Bills */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="font-medium text-lg mb-4">Pending Bills</h3>
            {loading ? (
              <p className="text-gray-500">Loading bills...</p>
            ) : unpaidBills.length === 0 ? (
              <p className="text-sm text-gray-500">
                You don't have any pending bills.
              </p>
            ) : (
              <div className="space-y-4">
                {unpaidBills.map((bill) => (
                  <div key={bill.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Meter No: {bill.connection.meterNo}
                        </p>
                        <p className="text-sm text-gray-600">
                          Due: {formatDate(bill.dueDate)}
                        </p>
                      </div>
                      <div className="text-lg font-semibold text-red-600">
                        {formatCurrency(bill.amount)}
                      </div>
                    </div>
                    <button className="mt-2 w-full px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Pay Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Complaints Section */}
          <Link href="/user/complaints" className="bg-white shadow rounded-lg p-6 hover:bg-gray-50">
            <h3 className="font-medium text-lg mb-3">Complaints</h3>
            <p className="text-sm text-gray-500">
              Submit a new complaint or check the status of your existing complaints.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
} 