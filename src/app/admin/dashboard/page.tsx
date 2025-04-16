"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import BillsChart from './BillsChart';

type DashboardStats = {
  totalUsers: number;
  totalConnections: number;
  pendingComplaints: number;
  unpaidBills: number;
  paidBills: number;
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalConnections: 0,
    pendingComplaints: 0,
    unpaidBills: 0,
    paidBills: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, connectionsRes, complaintsRes, billsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/connections'),
          fetch('/api/admin/complaints'),
          fetch('/api/admin/bills')
        ]);

        const users = await usersRes.json();
        const connections = await connectionsRes.json();
        const complaints = await complaintsRes.json();
        const bills = await billsRes.json();

        const unpaidBills = bills.filter((b: any) => 
          b.payments.length === 0 || b.payments.every((p: any) => p.status !== 'PAID')
        ).length;

        const paidBills = bills.filter((b: any) => 
          b.payments.some((p: any) => p.status === 'PAID')
        ).length;

        setStats({
          totalUsers: users.length,
          totalConnections: connections.length,
          pendingComplaints: complaints.filter((c: any) => c.status === 'PENDING').length,
          unpaidBills,
          paidBills
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Navbar */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-xl text-gray-500">Welcome back, {session?.user?.name}</h1>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center px-4 py-2 bg-white text-red-600 rounded-lg border border-red-200 hover:bg-red-50 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{loading ? '...' : stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Connections</p>
              <p className="text-3xl font-bold">{loading ? '...' : stats.totalConnections}</p>
            </div>
            <div className="p-3 bg-green-400 bg-opacity-30 rounded-full">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Pending Complaints</p>
              <p className="text-3xl font-bold">{loading ? '...' : stats.pendingComplaints}</p>
            </div>
            <div className="p-3 bg-yellow-400 bg-opacity-30 rounded-full">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Unpaid Bills</p>
              <p className="text-3xl font-bold">{loading ? '...' : stats.unpaidBills}</p>
            </div>
            <div className="p-3 bg-red-400 bg-opacity-30 rounded-full">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-6 h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <BillsChart 
              paidBills={stats.paidBills}
              unpaidBills={stats.unpaidBills}
            />
          )}
        </div>


        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link 
                  href="/admin/users" 
                  className="group relative bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Users</h3>
                      <p className="text-sm text-gray-500">Manage system users</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin/connections" 
                  className="group relative bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-200">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Connections</h3>
                      <p className="text-sm text-gray-500">Manage connections</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin/bills" 
                  className="group relative bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors duration-200">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Bills</h3>
                      <p className="text-sm text-gray-500">Manage customer bills</p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/admin/complaints" 
                  className="group relative bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors duration-200">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Complaints</h3>
                      <p className="text-sm text-gray-500">Handle user complaints</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 