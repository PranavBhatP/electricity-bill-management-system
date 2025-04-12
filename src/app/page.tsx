import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-6">
          Electricity Bill Management System
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          A simple and efficient way to manage your electricity connections, bills, and payments.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">Manage Connections</h2>
            <p className="text-gray-600">
              Add and manage multiple electricity connections under a single account.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">Pay Bills Online</h2>
            <p className="text-gray-600">
              View and pay your electricity bills conveniently online.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-3">Track Consumption</h2>
            <p className="text-gray-600">
              Monitor your electricity consumption and analyze usage patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
