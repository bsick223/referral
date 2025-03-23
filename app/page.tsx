import Link from "next/link";
import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Building,
  Users,
  CheckCircle,
  ArrowRight,
  Briefcase,
  UserCheck,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gray-50 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Two-column layout */}
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-16">
              {/* Content column */}
              <div className="w-full lg:w-1/2 space-y-6 md:space-y-8">
                <div>
                  <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-sm font-medium mb-3 md:mb-4">
                    Streamline Your Job Applications
                  </span>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-blue-600 leading-tight">
                    Referral
                    <br />
                    <span className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      Tracking Made Easy
                    </span>
                  </h1>
                </div>

                <p className="text-lg md:text-xl text-gray-600">
                  <strong>Organize and manage</strong> your job search referrals
                  in one place. Never lose track of who offered to refer you
                  again.
                </p>

                <div className="pt-2 md:pt-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Get Started for Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </SignedIn>
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-2 md:gap-3 pt-2">
                  <div className="inline-flex items-center text-sm md:text-base text-gray-700">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-1 md:mr-2" />
                    <span>Company Tracking</span>
                  </div>
                  <div className="inline-flex items-center text-sm md:text-base text-gray-700">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-1 md:mr-2" />
                    <span>Referral Management</span>
                  </div>
                  <div className="inline-flex items-center text-sm md:text-base text-gray-700">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-blue-500 mr-1 md:mr-2" />
                    <span>LinkedIn Integration</span>
                  </div>
                </div>
              </div>

              {/* Visual column */}
              <div className="w-full lg:w-1/2 relative mt-8 lg:mt-0 hidden sm:block">
                <div className="absolute top-4 left-4 right-4 bottom-4 bg-blue-100 rounded-2xl transform rotate-3"></div>

                <div className="bg-white p-4 md:p-8 rounded-2xl shadow-xl relative z-10 transform sm:-rotate-2 border border-gray-100">
                  <h3 className="text-lg md:text-xl font-bold text-blue-600 mb-3 md:mb-4">
                    Job Search Dashboard
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <Building className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Google</h4>
                        <p className="text-sm text-gray-500">3 referrals</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <Building className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Microsoft</h4>
                        <p className="text-sm text-gray-500">2 referrals</p>
                      </div>
                    </div>
                    <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <Building className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">Amazon</h4>
                        <p className="text-sm text-gray-500">1 referral</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 left-10 bg-white p-3 md:p-4 rounded-lg shadow-lg transform -rotate-3 border border-gray-100 hidden sm:block">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    <p className="text-sm font-medium">6 active referrals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Simplify Your Job Application Process
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              ReferralTracker helps you organize and manage all your job
              referrals in one place, so you never miss an opportunity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Company Tracking
              </h3>
              <p className="text-gray-600">
                Keep track of all the companies you're interested in and
                organize your job search efficiently.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Referral Management
              </h3>
              <p className="text-gray-600">
                Store contact information and LinkedIn profiles for everyone
                who's offered to refer you.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <ExternalLink className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                LinkedIn Integration
              </h3>
              <p className="text-gray-600">
                Easily access your contacts' LinkedIn profiles with just one
                click from your dashboard.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Time Saver
              </h3>
              <p className="text-gray-600">
                Save precious time during your job search by keeping all your
                referral information organized.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Job Search Assistant
              </h3>
              <p className="text-gray-600">
                Focus on what matters most: preparing for interviews and
                showcasing your skills.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Network Growth
              </h3>
              <p className="text-gray-600">
                Build and maintain your professional network by keeping track of
                all your connections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to organize your job referrals?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join today and never lose track of your valuable connections again.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white">
                Create a Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-blue-600">ReferralTracker</p>
              <p className="text-sm text-gray-500 mt-1">
                Organize your job search referrals efficiently
              </p>
            </div>
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} ReferralTracker. All rights
              reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
