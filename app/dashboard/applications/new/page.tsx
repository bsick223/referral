"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ChevronLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Application status options
const STATUS_OPTIONS = [
  { id: "applied", name: "Applied" },
  { id: "screening", name: "Screening" },
  { id: "interview", name: "Interview" },
  { id: "assessment", name: "Assessment" },
  { id: "final", name: "Final Round" },
  { id: "offer", name: "Offer" },
  { id: "rejected", name: "Rejected" },
];

export default function NewApplicationPage() {
  const { user } = useUser();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    position: "",
    status: "applied",
    dateApplied: new Date().toISOString().split("T")[0], // Today's date
    jobDescription: "",
    jobUrl: "",
    notes: "",
    salary: "",
    location: "",
    contactName: "",
    contactEmail: "",
  });

  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // TODO: Add connection to Convex here to save the application
      console.log("Submitting application:", formData);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

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
  if (!user) {
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
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link
            href="/dashboard/applications"
            className="mr-4 p-2 rounded-full bg-[#121a36]/50 text-gray-300 hover:bg-[#121a36] hover:text-white focus:outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="relative">
            <h2 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-gray-300 relative z-10">
              New Job Application
            </h2>
            <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-blue-500/80 via-purple-500/60 to-indigo-500/40"></div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#121a36]/50 backdrop-blur-sm shadow rounded-lg border border-[#20253d]/50 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Company Name */}
              <div className="col-span-2 sm:col-span-1">
                <label
                  htmlFor="companyName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Company Name*
                </label>
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#20253d] bg-[#0c1029]/80 shadow-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                />
              </div>

              {/* Position */}
              <div className="col-span-2 sm:col-span-1">
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-300"
                >
                  Position/Role*
                </label>
                <input
                  type="text"
                  name="position"
                  id="position"
                  required
                  value={formData.position}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#20253d] bg-[#0c1029]/80 shadow-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                />
              </div>

              {/* Status */}
              <div className="col-span-2 sm:col-span-1">
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-300"
                >
                  Status*
                </label>
                <select
                  name="status"
                  id="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#20253d] bg-[#0c1029]/80 shadow-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Applied */}
              <div className="col-span-2 sm:col-span-1">
                <label
                  htmlFor="dateApplied"
                  className="block text-sm font-medium text-gray-300"
                >
                  Date Applied*
                </label>
                <input
                  type="date"
                  name="dateApplied"
                  id="dateApplied"
                  required
                  value={formData.dateApplied}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#20253d] bg-[#0c1029]/80 shadow-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                />
              </div>

              {/* Location */}
              <div className="col-span-2 sm:col-span-1">
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
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#20253d] bg-[#0c1029]/80 shadow-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                  placeholder="e.g. Remote, New York, etc."
                />
              </div>

              {/* Salary */}
              <div className="col-span-2 sm:col-span-1">
                <label
                  htmlFor="salary"
                  className="block text-sm font-medium text-gray-300"
                >
                  Salary Range
                </label>
                <input
                  type="text"
                  name="salary"
                  id="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#20253d] bg-[#0c1029]/80 shadow-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                  placeholder="e.g. $80,000 - $100,000"
                />
              </div>

              {/* Job URL */}
              <div className="col-span-2">
                <label
                  htmlFor="jobUrl"
                  className="block text-sm font-medium text-gray-300"
                >
                  Job Posting URL
                </label>
                <input
                  type="url"
                  name="jobUrl"
                  id="jobUrl"
                  value={formData.jobUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#20253d] bg-[#0c1029]/80 shadow-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                  placeholder="https://..."
                />
              </div>

              {/* Job Description */}
              <div className="col-span-2">
                <label
                  htmlFor="jobDescription"
                  className="block text-sm font-medium text-gray-300"
                >
                  Job Description
                </label>
                <textarea
                  name="jobDescription"
                  id="jobDescription"
                  rows={4}
                  value={formData.jobDescription}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#20253d] bg-[#0c1029]/80 shadow-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                />
              </div>

              {/* Contact Details */}
              <div className="col-span-2 sm:col-span-1">
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
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#20253d] bg-[#0c1029]/80 shadow-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
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
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#20253d] bg-[#0c1029]/80 shadow-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                />
              </div>

              {/* Notes */}
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
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-[#20253d] bg-[#0c1029]/80 shadow-sm text-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                  placeholder="Any additional notes about this application..."
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-3">
              <Link
                href="/dashboard/applications"
                className="inline-flex justify-center py-2 px-4 border border-[#20253d] rounded-md shadow-sm text-sm font-medium text-gray-300 bg-[#0c1029] hover:bg-[#121a36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
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
