"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  connections: Connection[];
};

type Connection = {
  id: number;
  meterNo: string;
  tariffType: string;
  tariffRate: number;
};

export default function ManageConnections() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Form state
  const [selectedUserId, setSelectedUserId] = useState<number | "">("");
  const [meterNo, setMeterNo] = useState("");
  const [tariffType, setTariffType] = useState("residential");
  const [tariffRate, setTariffRate] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const tariffOptions = [
    { value: "residential", label: "Residential" },
    { value: "commercial", label: "Commercial" },
    { value: "industrial", label: "Industrial" },
    { value: "agricultural", label: "Agricultural" }
  ];

  // Suggested rate based on tariff type
  const getTariffRateSuggestion = (type: string): string => {
    switch (type) {
      case "residential":
        return "5.50";
      case "commercial":
        return "7.25";
      case "industrial":
        return "8.75";
      case "agricultural":
        return "4.50";
      default:
        return "5.50";
    }
  };

  // Update suggested rate when tariff type changes
  useEffect(() => {
    setTariffRate(getTariffRateSuggestion(tariffType));
  }, [tariffType]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/users");
        
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        
        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching users");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    
    if (!selectedUserId) {
      setFormError("Please select a user");
      return;
    }
    
    if (!meterNo) {
      setFormError("Please enter a meter number");
      return;
    }
    
    if (!tariffType) {
      setFormError("Please select a tariff type");
      return;
    }

    if (!tariffRate || isNaN(parseFloat(tariffRate)) || parseFloat(tariffRate) <= 0) {
      setFormError("Please enter a valid tariff rate (must be a positive number)");
      return;
    }
    
    try {
      setFormLoading(true);
      
      const response = await fetch("/api/admin/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUserId,
          meterNo,
          tariffType,
          tariffRate,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create connection");
      }
      
      // Update the local state to include the new connection
      setUsers(users.map(user => {
        if (user.id === selectedUserId) {
          return {
            ...user,
            connections: [...user.connections, data.connection]
          };
        }
        return user;
      }));
      
      setFormSuccess("Connection created successfully");
      
      // Reset form
      setSelectedUserId("");
      setMeterNo("");
      setTariffType("residential");
      setTariffRate(getTariffRateSuggestion("residential"));
    } catch (err: any) {
      setFormError(err.message || "An error occurred while creating the connection");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Connections</h1>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Connection</h2>
          
          {formError && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm">
              {formError}
            </div>
          )}
          
          {formSuccess && (
            <div className="p-3 mb-4 bg-green-100 text-green-700 rounded-md text-sm">
              {formSuccess}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
                Select User
              </label>
              <select
                id="userId"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : "")}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                required
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="meterNo" className="block text-sm font-medium text-gray-700">
                Meter Number
              </label>
              <input
                type="text"
                id="meterNo"
                value={meterNo}
                onChange={(e) => setMeterNo(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter unique meter number"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tariffType" className="block text-sm font-medium text-gray-700">
                  Tariff Type
                </label>
                <select
                  id="tariffType"
                  value={tariffType}
                  onChange={(e) => setTariffType(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                >
                  {tariffOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="tariffRate" className="block text-sm font-medium text-gray-700">
                  Tariff Rate ($ per unit)
                </label>
                <input
                  type="number"
                  id="tariffRate"
                  value={tariffRate}
                  onChange={(e) => setTariffRate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter rate per unit"
                  step="0.01"
                  min="0.01"
                  required
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={formLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {formLoading ? "Creating..." : "Create Connection"}
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Users and Their Connections</h2>
          
          {error && (
            <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {loading ? (
            <p className="text-gray-500">Loading users...</p>
          ) : (
            <div className="space-y-8">
              {users.length === 0 ? (
                <p className="text-gray-500">No users found.</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4">
                    <h3 className="font-medium text-lg">{user.name}</h3>
                    <p className="text-sm text-gray-500">Email: {user.email}</p>
                    <p className="text-sm text-gray-500">Phone: {user.phone}</p>
                    
                    <div className="mt-4">
                      <h4 className="font-medium">Connections:</h4>
                      
                      {user.connections.length === 0 ? (
                        <p className="text-sm text-gray-500 mt-2">No connections yet.</p>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {user.connections.map((connection) => (
                            <div key={connection.id} className="bg-gray-50 p-3 rounded-md">
                              <p className="text-sm"><span className="font-medium">Meter No:</span> {connection.meterNo}</p>
                              <p className="text-sm"><span className="font-medium">Tariff Type:</span> {connection.tariffType}</p>
                              <p className="text-sm"><span className="font-medium">Tariff Rate:</span> ${connection.tariffRate} per unit</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 