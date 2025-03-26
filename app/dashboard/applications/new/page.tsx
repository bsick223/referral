"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ChevronLeft, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";

// Define the form data structure
type FormData = {
  companyName: string;
  position: string;
  dateApplied: string;
  statusId: Id<"applicationStatuses">;
  location: string;
  salary: string;
  notes: string;
  contactName: string;
  contactEmail: string;
  url: string;
};

export default function NewApplicationPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    position: "",
    dateApplied: new Date().toISOString().split("T")[0], // Today's date as default
    statusId: "" as Id<"applicationStatuses">,
    location: "",
    salary: "",
    notes: "",
    contactName: "",
    contactEmail: "",
    url: "",
  });

  // Get application statuses from Convex
  const statuses = useQuery(api.applicationStatuses.listByUser, {
    userId: user?.id || "",
  });

  // Initialize default statuses if needed
  const initializeDefaultStatuses = useMutation(
    api.applicationStatuses.initializeDefaultStatuses
  );

  // Create application mutation
  const createApplication = useMutation(api.applications.create);

  // Initialize default statuses for new users
  useEffect(() => {
    if (user && statuses !== undefined && statuses.length === 0) {
      initializeDefaultStatuses({ userId: user.id });
    }
  }, [user, statuses, initializeDefaultStatuses]);

  // Set default status when statuses are loaded
  useEffect(() => {
    if (statuses && statuses.length > 0) {
      // Try to find "Applied" status, or use the first one
      const appliedStatus =
        statuses.find((s) => s.name === "Applied") || statuses[0];
      setFormData((prev) => ({ ...prev, statusId: appliedStatus._id }));
    }
  }, [statuses]);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      if (!formData.statusId) {
        throw new Error("Please select a status");
      }

      // Create application in Convex
      await createApplication({
        userId: user.id,
        companyName: formData.companyName,
        position: formData.position,
        dateApplied: formData.dateApplied,
        statusId: formData.statusId,
        location: formData.location || undefined,
        salary: formData.salary || undefined,
        notes: formData.notes || undefined,
        contactName: formData.contactName || undefined,
        contactEmail: formData.contactEmail || undefined,
        url: formData.url || undefined,
      });

      // Redirect to applications page on success
      router.push("/dashboard/applications");
    } catch (err) {
      setError("Failed to create application. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!user || statuses === undefined) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d1b] relative">
      {/* Noise Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          width: "200%",
          height: "200%",
          transform: "translate(-50%, -50%)",
        }}
      ></div>

      {/* Blurry background elements */}
      <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-gradient-to-r from-blue-600/20 to-blue-600/5 rounded-full opacity-20 blur-[120px]"></div>
      <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-purple-600/20 rounded-full opacity-20 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-0 w-1/3 h-1/3 bg-indigo-600/20 rounded-full opacity-20 blur-[80px]"></div>

      {/* Main content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <h2 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300 relative z-10">
              Add New Application
            </h2>
            <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-blue-500/80 via-purple-500/60 to-indigo-500/40"></div>
          </div>

          <Link
            href="/dashboard/applications"
            className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2 text-blue-400" />
            Back to Applications
          </Link>
        </div>

        {/* Application Form */}
        <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-lg border border-[#20253d]/50 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/40 rounded-md text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="col-span-2 sm:col-span-1">
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-[#20253d]/80 rounded-md bg-[#0c1029]/50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-300"
                >
                  Position *
                </label>
                <input
                  type="text"
                  name="position"
                  id="position"
                  required
                  value={formData.position}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-[#20253d]/80 rounded-md bg-[#0c1029]/50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="dateApplied"
                  className="block text-sm font-medium text-gray-300"
                >
                  Date Applied *
                </label>
                <input
                  type="date"
                  name="dateApplied"
                  id="dateApplied"
                  required
                  value={formData.dateApplied}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-[#20253d]/80 rounded-md bg-[#0c1029]/50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="statusId"
                  className="block text-sm font-medium text-gray-300"
                >
                  Status *
                </label>
                <select
                  name="statusId"
                  id="statusId"
                  required
                  value={formData.statusId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-[#20253d]/80 rounded-md bg-[#0c1029]/50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                >
                  {statuses.length === 0 ? (
                    <option value="" disabled>
                      Loading statuses...
                    </option>
                  ) : (
                    statuses
                      .sort((a, b) => a.order - b.order)
                      .map((status) => (
                        <option key={status._id} value={status._id}>
                          {status.name}
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-300"
                >
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-[#20253d]/80 rounded-md bg-[#0c1029]/50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="salary"
                  className="block text-sm font-medium text-gray-300"
                >
                  Salary
                </label>
                <input
                  type="text"
                  name="salary"
                  id="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-[#20253d]/80 rounded-md bg-[#0c1029]/50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                  placeholder="e.g. $80,000 - $100,000"
                />
              </div>

              <div>
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-300"
                >
                  URL
                </label>
                <input
                  type="url"
                  name="url"
                  id="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-[#20253d]/80 rounded-md bg-[#0c1029]/50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label
                  htmlFor="contactName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Contact Name
                </label>
                <input
                  type="text"
                  name="contactName"
                  id="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-[#20253d]/80 rounded-md bg-[#0c1029]/50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="contactEmail"
                  className="block text-sm font-medium text-gray-300"
                >
                  Contact Email
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  id="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-[#20253d]/80 rounded-md bg-[#0c1029]/50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                />
              </div>

              <div className="col-span-2">
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-300"
                >
                  Notes
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-[#20253d]/80 rounded-md bg-[#0c1029]/50 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-white text-sm"
                  placeholder="Any additional information about this application..."
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => router.push("/dashboard/applications")}
                className="mr-4 px-4 py-2 border border-[#20253d]/50 text-sm font-medium rounded-md text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-blue-500 text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Application"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
