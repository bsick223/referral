"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  ArrowLeft,
  EyeOff,
  Users,
  Save,
  Loader2,
  Check,
  Info,
  Globe,
} from "lucide-react";
import Link from "next/link";
import SettingsTabs from "@/components/SettingsTabs";

export default function PrivacySettingsPage() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Get profile settings
  const profileSettings = useQuery(
    api.userProfiles.getProfileSettings,
    user?.id ? { userId: user.id } : "skip"
  );

  // Update privacy settings mutation
  const updatePrivacySettings = useMutation(
    api.userProfiles.updatePrivacySettings
  );

  // Form state
  const [formData, setFormData] = useState({
    hideFromLeaderboards: false,
    profileVisibility: "public",
    showApplicationsCount: true,
    showReferralsCount: true,
    showCompaniesCount: true,
    showApplicationsInCommunity: true,
  });

  // Update form data when profile settings are loaded
  useEffect(() => {
    if (profileSettings) {
      setFormData({
        hideFromLeaderboards: profileSettings.hideFromLeaderboards || false,
        profileVisibility: profileSettings.profileVisibility || "public",
        showApplicationsCount: profileSettings.showApplicationsCount !== false,
        showReferralsCount: profileSettings.showReferralsCount !== false,
        showCompaniesCount: profileSettings.showCompaniesCount !== false,
        showApplicationsInCommunity:
          profileSettings.showApplicationsInCommunity !== false,
      });
      setIsLoading(false);
    }
  }, [profileSettings]);

  // Handle toggle change
  const handleToggleChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: !prev[name as keyof typeof prev],
    }));
  };

  // Handle visibility change
  const handleVisibilityChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      profileVisibility: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");

    try {
      await updatePrivacySettings({
        userId: user!.id,
        hideFromLeaderboards: formData.hideFromLeaderboards,
        profileVisibility: formData.profileVisibility,
        showApplicationsCount: formData.showApplicationsCount,
        showReferralsCount: formData.showReferralsCount,
        showCompaniesCount: formData.showCompaniesCount,
        showApplicationsInCommunity: formData.showApplicationsInCommunity,
      });

      setSuccessMessage("Privacy settings updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating privacy settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle button component
  const ToggleButton = ({
    label,
    description,
    enabled,
    onChange,
  }: {
    label: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
  }) => (
    <div className="flex items-start justify-between py-4 border-b border-[#20253d]/30">
      <div className="pr-4">
        <h3 className="text-sm font-medium text-gray-200">{label}</h3>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          enabled ? "bg-blue-600" : "bg-gray-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );

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
      <SettingsTabs activeTab="privacy" />

      {/* Privacy Settings Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50 mb-6">
          <div className="p-6 border-b border-[#20253d]/50">
            <h2 className="text-xl font-light text-white flex items-center">
              <EyeOff className="h-5 w-5 mr-2 text-blue-400" />
              Profile Visibility
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Control who can see your profile and activity
            </p>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-200 mb-3">
                    Profile Visibility
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleVisibilityChange("public")}
                      className={`px-4 py-3 rounded-md text-left ${
                        formData.profileVisibility === "public"
                          ? "bg-blue-600/20 border-2 border-blue-500"
                          : "bg-[#0c1029] border border-[#20253d]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          Public
                        </span>
                        {formData.profileVisibility === "public" && (
                          <Check className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Your profile is visible to everyone
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVisibilityChange("private")}
                      className={`px-4 py-3 rounded-md text-left ${
                        formData.profileVisibility === "private"
                          ? "bg-blue-600/20 border-2 border-blue-500"
                          : "bg-[#0c1029] border border-[#20253d]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-white">
                          Private
                        </span>
                        {formData.profileVisibility === "private" && (
                          <Check className="h-4 w-4 text-blue-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Only you can see your profile
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <ToggleButton
                    label="Hide from Leaderboards"
                    description="When enabled, your name and statistics will not appear on any leaderboards"
                    enabled={formData.hideFromLeaderboards}
                    onChange={() => handleToggleChange("hideFromLeaderboards")}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Community Settings Section */}
        <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50 mb-6">
          <div className="p-6 border-b border-[#20253d]/50">
            <h2 className="text-xl font-light text-white flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-400" />
              Community Settings
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Control what information is shared with the community
            </p>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-1">
                <ToggleButton
                  label="Share Applications in Community"
                  description="Allow your job applications to appear in the community timeline"
                  enabled={formData.showApplicationsInCommunity}
                  onChange={() =>
                    handleToggleChange("showApplicationsInCommunity")
                  }
                />
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-start">
                  <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-300">
                    When enabled, your applications will be visible in the
                    community timeline. Your name will be shown, along with
                    application details like company name, position, and status.
                    Turn this off if you don&apos;t want your applications to
                    appear in the community feed.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
          <div className="p-6 border-b border-[#20253d]/50">
            <h2 className="text-xl font-light text-white flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              Profile Information Privacy
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Control what information is visible to others on your profile
            </p>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <ToggleButton
                    label="Show Applications Count"
                    description="Allow others to see how many job applications you've submitted"
                    enabled={formData.showApplicationsCount}
                    onChange={() => handleToggleChange("showApplicationsCount")}
                  />
                  <ToggleButton
                    label="Show Referrals Count"
                    description="Allow others to see how many referrals you've received"
                    enabled={formData.showReferralsCount}
                    onChange={() => handleToggleChange("showReferralsCount")}
                  />
                  <ToggleButton
                    label="Show Companies Count"
                    description="Allow others to see how many companies you've applied to"
                    enabled={formData.showCompaniesCount}
                    onChange={() => handleToggleChange("showCompaniesCount")}
                  />
                  <ToggleButton
                    label="Show Applications in Community"
                    description="Share your job applications in the community timeline for others to see"
                    enabled={formData.showApplicationsInCommunity}
                    onChange={() =>
                      handleToggleChange("showApplicationsInCommunity")
                    }
                  />
                </div>

                <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-start">
                  <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-300">
                    Note: If you set your profile to private, none of your
                    information will be visible regardless of these settings.
                    These options only apply when your profile is public.
                  </p>
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
          </div>
        </div>
      </form>
    </div>
  );
}
