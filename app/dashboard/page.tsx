"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { PlusCircle, Building, RefreshCw, MessageSquare } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();

  // Fetch companies for the current user
  const companies = useQuery(api.companies.listByUser, {
    userId: user?.id || "",
  });

  // Initialize seed data
  const ensureDefaultTemplate = useMutation(
    api.seedMessages.ensureDefaultTemplate
  );

  useEffect(() => {
    if (user) {
      ensureDefaultTemplate({ userId: user.id });
    }
  }, [user, ensureDefaultTemplate]);

  // Loading state
  if (!user || companies === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">My Companies</h2>
          <div className="flex space-x-3">
            <Link
              href="/dashboard/messages"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MessageSquare className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Messages</span>
            </Link>
            <Link
              href="/dashboard/companies/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Add Company</span>
            </Link>
          </div>
        </div>

        {/* Companies grid */}
        {companies.length === 0 ? (
          <div className="text-center py-16 bg-white shadow rounded-lg">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No companies yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your first company.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/companies/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Company</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Link
                key={company._id}
                href={`/dashboard/companies/${company._id}`}
                className="block bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {company.name}
                    </h3>
                    <Building className="h-5 w-5 text-blue-500" />
                  </div>
                  {company.description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {company.description}
                    </p>
                  )}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                    <div className="text-sm text-gray-500">
                      Added {new Date(company.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
