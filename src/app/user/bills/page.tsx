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

export default function UserBillsDashboard() {
  const { data: session } = useSession();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<{[key: number]: string}>({});

  useEffect(() => {
    fetchBills();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (billId: number) => {
    try {
      setPaymentStatus(prev => ({ ...prev, [billId]: "processing" }));
      
      const response = await fetch("/api/user/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ billId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Payment failed");
      }

      // Update the bills list to reflect the payment
      await fetchBills();
      setPaymentStatus(prev => ({ ...prev, [billId]: "success" }));

      // Clear the success status after 3 seconds
      setTimeout(() => {
        setPaymentStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[billId];
          return newStatus;
        });
      }, 3000);

    } catch (err: any) {
      setPaymentStatus(prev => ({ ...prev, [billId]: "error" }));
      console.error("Payment error:", err);
      
      // Clear the error status after 3 seconds
      setTimeout(() => {
        setPaymentStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[billId];
          return newStatus;
        });
      }, 3000);
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl text-gray-700 font-bold">My Bills</h1>
          <div className="space-x-4">
            <Link 
              href="/user/payments"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Payment History
            </Link>
            <Link 
              href="/user/dashboard"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Bills List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Bills History</h2>
            
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
                        Meter No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Bill Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bills.map((bill) => (
                      <tr key={bill.id}>
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
                              ? 'bg-green-100 text-green-800'
                              : new Date(bill.dueDate) < new Date()
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {bill.payments.length > 0 
                              ? 'PAID' 
                              : new Date(bill.dueDate) < new Date()
                                ? 'OVERDUE'
                                : 'PENDING'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {bill.payments.length === 0 && (
                            <div>
                              <button
                                onClick={() => handlePayment(bill.id)}
                                disabled={paymentStatus[bill.id] === "processing"}
                                className={`inline-flex items-center px-4 py-2 rounded-md text-white font-medium text-sm
                                  ${paymentStatus[bill.id] === "processing"
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                                  }`}
                              >
                                {paymentStatus[bill.id] === "processing" ? (
                                  <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                  </>
                                ) : (
                                  <>Pay Now</>
                                )}
                              </button>
                              {new Date(bill.dueDate) < new Date() && (
                                <p className="mt-1 text-xs text-red-600">
                                  This bill is overdue. Please pay as soon as possible.
                                </p>
                              )}
                            </div>
                          )}
                          {paymentStatus[bill.id] === "success" && (
                            <div className="text-green-600 font-medium">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                Payment successful!
                              </span>
                              <Link 
                                href="/user/payments" 
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1 block"
                              >
                                View payment details →
                              </Link>
                            </div>
                          )}
                          {paymentStatus[bill.id] === "error" && (
                            <div className="text-red-600 font-medium">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                Payment failed. Please try again.
                              </span>
                            </div>
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