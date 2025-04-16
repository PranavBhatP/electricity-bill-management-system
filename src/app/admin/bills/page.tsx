"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
};

type Connection = {
  id: number;
  meterNo: string;
  tariffType: string;
  tariffRate: string;
  user: User;
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

// Add these utility functions outside the component
const padZero = (num: number) => num.toString().padStart(2, '0');

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BillsDashboard() {
  const { data: session } = useSession();
  const [bills, setBills] = useState<Bill[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form state
  const [selectedConnectionId, setSelectedConnectionId] = useState<number | "">("");
  const [unitsConsumed, setUnitsConsumed] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBills();
    fetchConnections();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await fetch("/api/admin/bills");
      
      if (!response.ok) {
        throw new Error("Failed to fetch bills");
      }
      
      const data = await response.json();
      setBills(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching bills");
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/admin/connections");
      
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
  };

  // Calculate bill amount when units or connection changes
  useEffect(() => {
    if (selectedConnectionId && unitsConsumed) {
      const connection = connections.find(c => c.id === Number(selectedConnectionId));
      if (connection) {
        const amount = parseFloat(connection.tariffRate) * parseFloat(unitsConsumed);
        setCalculatedAmount(amount);
      }
    } else {
      setCalculatedAmount(null);
    }
  }, [selectedConnectionId, unitsConsumed, connections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    
    if (!selectedConnectionId) {
      setFormError("Please select a connection");
      return;
    }
    
    if (!unitsConsumed || parseFloat(unitsConsumed) <= 0) {
      setFormError("Please enter a valid number of units consumed");
      return;
    }
    
    if (!dueDate) {
      setFormError("Please select a due date");
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch("/api/admin/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          connectionId: selectedConnectionId,
          unitsConsumed: parseFloat(unitsConsumed),
          dueDate,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create bill");
      }
      
      // Instead of adding the new bill directly, fetch all bills again
      await fetchBills();
      
      // Reset form
      setSelectedConnectionId("");
      setUnitsConsumed("");
      setDueDate("");
      setCalculatedAmount(null);
      setFormSuccess("Bill created successfully");
    } catch (err: any) {
      setFormError(err.message || "An error occurred while creating the bill");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = months[date.getMonth()];
    const day = padZero(date.getDate());
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const formatCurrency = (amount: string) => {
    const value = parseFloat(amount);
    const dollars = Math.floor(value);
    const cents = Math.round((value - dollars) * 100);
    return `$${dollars.toLocaleString()}.${padZero(cents)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Bills Management</h1>
          <Link 
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Create Bill Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Bill</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="connectionId" className="block text-sm font-medium text-gray-700">
                  Select Connection
                </label>
                <select
                  id="connectionId"
                  value={selectedConnectionId}
                  onChange={(e) => setSelectedConnectionId(e.target.value ? Number(e.target.value) : "")}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                >
                  <option value="">Select a connection</option>
                  {connections.map((connection) => (
                    <option key={connection.id} value={connection.id}>
                      {connection.user.name} - Meter: {connection.meterNo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="unitsConsumed" className="block text-sm font-medium text-gray-700">
                  Units Consumed
                </label>
                <input
                  type="number"
                  id="unitsConsumed"
                  value={unitsConsumed}
                  onChange={(e) => setUnitsConsumed(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter units consumed"
                  min="0"
                  step="1"
                  required
                />
              </div>

              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>

              {calculatedAmount !== null && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <label className="block text-sm font-medium text-blue-700">
                    Calculated Amount
                  </label>
                  <div className="mt-1 text-2xl font-semibold text-blue-900">
                    {formatCurrency(calculatedAmount.toString())}
                  </div>
                </div>
              )}
            </div>

            {formError && (
              <div className="text-sm text-red-600">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="text-sm text-green-600">
                {formSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? "Creating Bill..." : "Create Bill"}
            </button>
          </form>
        </div>

        {/* Bills List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Bills</h2>
            
            {error && (
              <div className="mb-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center text-gray-500 py-4">
                Loading bills...
              </div>
            ) : bills.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No bills found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Meter No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bill Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bills.map((bill) => (
                      <tr key={bill.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {bill.connection.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {bill.connection.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bill.connection.meterNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(bill.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(bill.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${bill.payments.length > 0 
                              ? bill.payments[0].status === 'PAID' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'}`}
                          >
                            {bill.payments.length > 0 
                              ? bill.payments[0].status
                              : 'UNPAID'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {bill.payments.length > 0 ? (
                            <div>
                              <div>Amount Paid: {formatCurrency(bill.payments[0].amount)}</div>
                              <div>Status: {bill.payments[0].status}</div>
                            </div>
                          ) : (
                            "No payment recorded"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 