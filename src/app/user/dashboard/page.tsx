"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import ConsumptionGraph from './ConsumptionGraph';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

type Consumption = {
  id: number;
  units: number;
  date: string;
};

export default function UserDashboard() {
  const { data: session } = useSession();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [consumptionData, setConsumptionData] = useState<Consumption[]>([]);
  const [consumptionLoading, setConsumptionLoading] = useState(false);

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

  const fetchConsumptionData = async (connectionId: number) => {
    try {
      setConsumptionLoading(true);
      const response = await fetch(`/api/user/consumption?connectionId=${connectionId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch consumption data");
      }
      
      const data = await response.json();
      setConsumptionData(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching consumption data");
    } finally {
      setConsumptionLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConnection) {
      fetchConsumptionData(selectedConnection.id);
    }
  }, [selectedConnection]);

  const chartData = {
    labels: consumptionData.map(c => new Date(c.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    datasets: [
      {
        label: 'Units Consumed',
        data: consumptionData.map(c => c.units),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Consumption History',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Units Consumed'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  };

  const redirectToBills = () => {
    router.push("/user/bills");
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

  const totalUnpaidAmount = unpaidBills.reduce((total, bill) => 
    total + parseFloat(bill.amount), 0
  );

  return (
    <div className="max-w-7xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Connections</p>
              <p className="text-3xl font-bold">{connections.length}</p>
            </div>
            <div className="p-3 bg-blue-400 bg-opacity-30 rounded-full">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Pending Bills</p>
              <p className="text-3xl font-bold">{unpaidBills.length}</p>
            </div>
            <div className="p-3 bg-purple-400 bg-opacity-30 rounded-full">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Total Due Amount</p>
              <p className="text-3xl font-bold">{formatCurrency(totalUnpaidAmount.toString())}</p>
            </div>
            <div className="p-3 bg-red-400 bg-opacity-30 rounded-full">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connections Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">My Connections</h2>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No connections</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by contacting an administrator to set up a connection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className={`relative group bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 cursor-pointer ${
                        selectedConnection?.id === connection.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedConnection(connection)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Meter No: {connection.meterNo}</p>
                          <p className="mt-1 text-sm text-gray-500">Type: {connection.tariffType}</p>
                          <p className="mt-1 text-sm text-gray-500">Rate: ${connection.tariffRate}/unit</p>
                        </div>
                        <div className="text-gray-400 group-hover:text-gray-500">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Consumption Graph */}
              {selectedConnection && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Consumption History - Meter No: {selectedConnection.meterNo}
                  </h3>
                  {consumptionLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : consumptionData.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-gray-500">No consumption data available for the last 6 months.</p>
                    </div>
                  ) : (
                    <ConsumptionGraph 
                      consumptionData={consumptionData}
                      meterNo={selectedConnection.meterNo}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Pending Bills Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Bills</h2>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : unpaidBills.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">All paid up!</h3>
                  <p className="mt-1 text-sm text-gray-500">You have no pending bills.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unpaidBills.map((bill) => (
                    <div
                      key={bill.id}
                      className="relative group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Meter No: {bill.connection.meterNo}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Due: {formatDate(bill.dueDate)}
                          </p>
                        </div>
                        <div className="text-lg font-semibold text-red-600">
                          {formatCurrency(bill.amount)}
                        </div>
                      </div>
                      <button
                        onClick={() => redirectToBills()}
                        className="mt-4 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Pay Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-4">
                <Link
                  href="/user/bills"
                  className="group block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">View All Bills</p>
                      <p className="text-sm text-gray-500">Check your billing history</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/user/complaints"
                  className="group block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">Submit Complaint</p>
                      <p className="text-sm text-gray-500">Report an issue or concern</p>
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