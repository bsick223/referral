"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Phone,
  Linkedin,
  Save,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import SettingsTabs from "@/components/SettingsTabs";

export default function SettingsPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Get profile settings
  const profileSettings = useQuery(
    api.userProfiles.getProfileSettings,
    user?.id ? { userId: user.id } : "skip"
  );

  // Update profile settings mutation
  const updateProfile = useMutation(api.userProfiles.updateProfileSettings);

  // Form state
  const [formData, setFormData] = useState({
    professionalTitle: "",
    location: "",
    phoneNumber: "",
    linkedinUrl: "",
  });

  // Update form data when profile settings are loaded
  useEffect(() => {
    if (profileSettings) {
      setFormData({
        professionalTitle: profileSettings.professionalTitle || "",
        location: profileSettings.location || "",
        phoneNumber: profileSettings.phoneNumber || "",
        linkedinUrl: profileSettings.linkedinUrl || "",
      });
      setIsLoading(false);
    }
  }, [profileSettings]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");

    try {
      await updateProfile({
        userId: user!.id,
        professionalTitle: formData.professionalTitle,
        location: formData.location,
        phoneNumber: formData.phoneNumber,
        linkedinUrl: formData.linkedinUrl,
      });

      setSuccessMessage("Profile settings updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/dashboard"
          className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Dashboard</span>
        </Link>
        <div className="relative">
          <h1 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-gray-300 relative z-10">
            Settings
          </h1>
          <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-blue-500/80 via-purple-500/60 to-blue-400/40"></div>
        </div>
      </div>

      {/* Settings tabs */}
      <SettingsTabs activeTab="profile" />

      {/* Profile Settings Form */}
      <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
        <div className="p-6 border-b border-[#20253d]/50">
          <h2 className="text-xl font-light text-white">Profile Information</h2>
          <p className="text-gray-400 text-sm mt-1">
            Update your professional details which will be visible on your
            public profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {/* Professional Title */}
                <div>
                  <label
                    htmlFor="professionalTitle"
                    className="flex items-center text-sm font-medium text-gray-300 mb-2"
                  >
                    <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                    Professional Title
                  </label>
                  <input
                    type="text"
                    id="professionalTitle"
                    name="professionalTitle"
                    value={formData.professionalTitle}
                    onChange={handleInputChange}
                    placeholder="e.g. Software Engineer, Product Manager"
                    className="w-full bg-[#0c1029] border border-[#20253d] rounded-md py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label
                    htmlFor="location"
                    className="flex items-center text-sm font-medium text-gray-300 mb-2"
                  >
                    <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full bg-[#0c1029] border border-[#20253d] rounded-md py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="flex items-center text-sm font-medium text-gray-300 mb-2"
                  >
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. +1 (555) 123-4567"
                    className="w-full bg-[#0c1029] border border-[#20253d] rounded-md py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* LinkedIn URL */}
                <div>
                  <label
                    htmlFor="linkedinUrl"
                    className="flex items-center text-sm font-medium text-gray-300 mb-2"
                  >
                    <Linkedin className="h-4 w-4 mr-2 text-gray-400" />
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="e.g. https://linkedin.com/in/yourprofile"
                    className="w-full bg-[#0c1029] border border-[#20253d] rounded-md py-2 px-3 text-white focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Success message */}
              {successMessage && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-md text-green-400 text-sm">
                  {successMessage}
                </div>
              )}

              {/* Submit button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-blue-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
