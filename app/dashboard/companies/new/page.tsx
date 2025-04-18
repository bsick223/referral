"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

export default function NewCompanyPage() {
  const router = useRouter();
  const { user } = useUser();
  const createCompany = useMutation(api.companies.create);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [websiteError, setWebsiteError] = useState("");

  // Function to validate URL format
  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Empty URLs are valid (optional field)

    // Basic domain pattern - allows domains like google.com, sub.domain.co.uk, etc.
    const domainPattern =
      /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

    // Check if it already has http/https
    if (url.match(/^https?:\/\//)) {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }

    // Check if it's a valid domain pattern (for entries like google.com or www.example.com)
    if (url.startsWith("www.")) {
      return domainPattern.test(url.substring(4));
    }

    return domainPattern.test(url);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear website error when field is empty
    if (name === "website") {
      if (!value) {
        setWebsiteError("");
      } else if (!isValidUrl(value)) {
        setWebsiteError(
          "Please enter a valid website address (e.g., google.com)"
        );
      } else {
        setWebsiteError("");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    // Validate website URL if provided
    if (formData.website && !isValidUrl(formData.website)) {
      setWebsiteError(
        "Please enter a valid website address (e.g., google.com)"
      );
      return;
    }

    setIsSubmitting(true);

    // Format website URL if provided
    let formattedWebsite = formData.website;
    if (formattedWebsite) {
      // If it doesn't start with http:// or https://
      if (!formattedWebsite.match(/^https?:\/\//)) {
        // If it starts with www.
        if (formattedWebsite.startsWith("www.")) {
          formattedWebsite = `https://${formattedWebsite}`;
        } else {
          // If it's just a domain like google.com
          formattedWebsite = `https://${formattedWebsite}`;
        }
      }
    }

    try {
      const companyId = await createCompany({
        name: formData.name,
        description: formData.description || undefined,
        website: formattedWebsite || undefined,
        userId: user.id,
      });

      // Redirect to the new company page instead of the dashboard
      router.push(`/dashboard/companies/${companyId}`);
      
    } catch (error) {
      console.error("Error creating company:", error);
      setIsSubmitting(false);
    }
  };

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
      <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-gradient-to-r from-orange-600/20 to-orange-600/5 rounded-full opacity-20 blur-[120px]"></div>
      <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-blue-600/20 rounded-full opacity-20 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-0 w-1/3 h-1/3 bg-indigo-600/20 rounded-full opacity-20 blur-[80px]"></div>

      {/* Header */}
      <header className="bg-[#121a36]/50 backdrop-blur-sm shadow border-b border-[#20253d]/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <Link
            href="/dashboard/referrals"
            className="inline-flex items-center mr-4 text-gray-300 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="relative">
            <Link href="/dashboard/referrals" className="relative">
              <h1 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300 relative z-10">
                Add New Company
              </h1>
              <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"></div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#121a36]/50 backdrop-blur-sm shadow border border-[#20253d]/50 rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300"
                >
                  Company Name *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full sm:text-sm rounded-md px-3 py-2 
                    bg-[#0c1029] border-[#20253d] text-gray-300
                    focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Google"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-300"
                >
                  Website{" "}
                  <span className="text-xs text-gray-400">(logo display)</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className={`block w-full sm:text-sm rounded-md px-3 py-2 
                    bg-[#0c1029] border-[#20253d] text-gray-300
                    focus:ring-blue-500 focus:border-blue-500 ${
                      websiteError ? "border-red-500" : ""
                    }`}
                    placeholder="e.g. google.com"
                  />
                  {websiteError && (
                    <p className="mt-1 text-xs text-red-500">{websiteError}</p>
                  )}
                  {!websiteError && formData.website && (
                    <p className="mt-1 text-xs text-green-500">
                      Will be saved as:{" "}
                      {formData.website.match(/^https?:\/\//)
                        ? formData.website
                        : formData.website.startsWith("www.")
                        ? `https://${formData.website}`
                        : `https://${formData.website}`}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-300"
                >
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="block w-full sm:text-sm rounded-md px-3 py-2 
                    bg-[#0c1029] border-[#20253d] text-gray-300
                    focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of the company"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/dashboard/referrals"
                  className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3 cursor-pointer"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name}
                  className="inline-flex items-center px-4 py-2 border-0 border-transparent rounded-md text-sm font-medium text-white 
                  bg-gradient-to-r from-orange-500 via-purple-500 to-blue-600 hover:from-orange-400 hover:via-purple-400 hover:to-blue-500
                  shadow-[0_0_15px_rgba(249,115,22,0.5)] 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-90 cursor-pointer
                  "
                >
                  {isSubmitting ? "Creating..." : "Create Company"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
