"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Complaint = {
  id: number;
  description: string;
  status: string;
  createdAt?: string;
};

export default function UserComplaints() {
  const { data: session } = useSession();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user/complaints");
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");
    
    if (!description.trim()) {
      setSubmitError("Please enter a description");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const response = await fetch("/api/user/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description: description.trim() }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit complaint");
      }
      
      const newComplaint = await response.json();
      
      // Add the new complaint to the list
      setComplaints([newComplaint, ...complaints]);
      setDescription("");
      setSubmitSuccess("Complaint submitted successfully");
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while submitting the complaint");
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Complaints</h1>
          <Link 
            href="/user/dashboard"
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Submit Complaint Form */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Submit New Complaint</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe your issue..."
                disabled={submitting}
              />
            </div>

            {submitError && (
              <div className="text-sm text-red-600">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="text-sm text-green-600">
                {submitSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </form>
        </div>

        {/* Complaints List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">My Complaint History</h2>
            
            {error && (
              <div className="mb-4 text-sm text-red-600">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center text-gray-500 py-4">
                Loading complaints...
              </div>
            ) : complaints.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No complaints found
              </div>
            ) : (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm text-gray-900">
                        {complaint.description}
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(complaint.status)}`}>
                        {formatStatus(complaint.status)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Submitted on {new Date(complaint.createdAt || "").toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 