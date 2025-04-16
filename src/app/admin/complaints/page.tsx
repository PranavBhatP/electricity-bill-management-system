"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type User = {
  id: number;
  name: string;
  email: string;
};

type Complaint = {
  id: number;
  description: string;
  status: string;
  user: User;
  createdAt?: string;
};

export default function ComplaintsDashboard() {
  const { data: session } = useSession();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateLoading, setUpdateLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/complaints");
      
      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }
      
      const data = await response.json();
      setComplaints(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching complaints");
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId: number, newStatus: string) => {
    try {
      setUpdateLoading(complaintId);
      
      const response = await fetch("/api/admin/complaints", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          complaintId,
          status: newStatus,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update complaint status");
      }
      
      const updatedComplaint = await response.json();
      
      // Update the complaints list with the new status
      setComplaints(complaints.map(complaint => 
        complaint.id === complaintId ? updatedComplaint : complaint
      ));
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the complaint");
    } finally {
      setUpdateLoading(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading complaints...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl text-black font-bold">Complaints Dashboard</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No complaints found
                    </td>
                  </tr>
                ) : (
                  complaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {complaint.user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {complaint.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {complaint.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(complaint.status)}`}>
                          {formatStatus(complaint.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={complaint.status}
                          onChange={(e) => updateComplaintStatus(complaint.id, e.target.value)}
                          disabled={updateLoading === complaint.id}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under Review</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 