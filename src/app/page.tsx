import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">EBill</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 pt-16">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Manage Your Electricity Bills
            <br />
            <span className="text-blue-200">Smarter & Easier</span>
          </h1>
          <p className="mt-6 max-w-3xl text-xl text-blue-100">
            A comprehensive solution for managing your electricity connections, tracking consumption,
            and handling payments - all in one place.
          </p>
          <div className="mt-10 flex space-x-4">
            <Link
              href="/auth/signup"
              className="px-8 py-3 bg-white text-blue-600 font-medium rounded-md hover:bg-blue-50 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/auth/signin"
              className="px-8 py-3 border border-transparent text-white font-medium rounded-md hover:bg-blue-700 bg-blue-500 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to manage your electricity bills
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Access all features in one integrated platform
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Connection Management */}
              <div className="relative group">
                <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 sm:h-64 lg:aspect-w-1 lg:aspect-h-1">
                  <div className="h-full w-full bg-gradient-to-br from-blue-400 to-blue-600 p-8">
                    <div className="flex h-full flex-col justify-between">
                      <div className="text-white text-4xl font-bold">
                        Connection Management
                      </div>
                      <div>
                        <p className="text-blue-100 mb-4">
                          Add and manage multiple electricity connections under a single account.
                          Track each connection's status and history.
                        </p>
                        <Link
                          href="/auth/signin"
                          className="inline-flex items-center text-white hover:underline"
                        >
                          Manage Connections
                          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill Payment */}
              <div className="relative group">
                <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 sm:h-64 lg:aspect-w-1 lg:aspect-h-1">
                  <div className="h-full w-full bg-gradient-to-br from-green-400 to-green-600 p-8">
                    <div className="flex h-full flex-col justify-between">
                      <div className="text-white text-4xl font-bold">
                        Bill Payment
                      </div>
                      <div>
                        <p className="text-green-100 mb-4">
                          View your bills, check payment history, and make secure online payments
                          with just a few clicks.
                        </p>
                        <Link
                          href="/auth/signin"
                          className="inline-flex items-center text-white hover:underline"
                        >
                          Pay Bills
                          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Analytics */}
              <div className="relative group">
                <div className="relative h-80 w-full overflow-hidden rounded-lg bg-white group-hover:opacity-75 sm:aspect-w-2 sm:aspect-h-1 sm:h-64 lg:aspect-w-1 lg:aspect-h-1">
                  <div className="h-full w-full bg-gradient-to-br from-purple-400 to-purple-600 p-8">
                    <div className="flex h-full flex-col justify-between">
                      <div className="text-white text-4xl font-bold">
                        Usage Analytics
                      </div>
                      <div>
                        <p className="text-purple-100 mb-4">
                          Monitor your electricity consumption patterns and get insights
                          to optimize your usage.
                        </p>
                        <Link
                          href="/auth/signin"
                          className="inline-flex items-center text-white hover:underline"
                        >
                          View Analytics
                          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-700 rounded-lg shadow-xl overflow-hidden">
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Ready to get started?</span>
                  <span className="block text-blue-200">Create your account today.</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-blue-200">
                  Join thousands of users who are already managing their electricity bills efficiently.
                </p>
                <Link
                  href="/auth/signup"
                  className="mt-8 bg-white border border-transparent rounded-md shadow px-6 py-3 inline-flex items-center text-base font-medium text-blue-600 hover:bg-blue-50"
                >
                  Sign up for free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
