"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  ArrowLeft,
  PlusCircle,
  User,
  Trash,
  RefreshCw,
  ExternalLink,
  Pencil,
  Check,
  X,
  Tag,
  Plus,
  ChevronDown,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";
import Image from "next/image";

// Define tag color options for dark theme - same as in messages page
const TAG_COLORS = [
  { bg: "bg-blue-900/50", text: "text-blue-300", name: "Blue" },
  { bg: "bg-green-900/50", text: "text-green-300", name: "Green" },
  { bg: "bg-red-900/50", text: "text-red-300", name: "Red" },
  { bg: "bg-yellow-900/50", text: "text-yellow-300", name: "Yellow" },
  { bg: "bg-purple-900/50", text: "text-purple-300", name: "Purple" },
  { bg: "bg-pink-900/50", text: "text-pink-300", name: "Pink" },
  { bg: "bg-indigo-900/50", text: "text-indigo-300", name: "Indigo" },
  { bg: "bg-gray-800/50", text: "text-gray-300", name: "Gray" },
  { bg: "bg-orange-900/50", text: "text-orange-300", name: "Orange" },
];

interface Tag {
  name: string;
  color: number; // Index of the color in TAG_COLORS
}

// Define Referral interface
interface Referral {
  _id: Id<"referrals">;
  name: string;
  linkedinUrl?: string;
  email?: string;
  phoneNumber?: string;
  notes?: string;
  tags?: string[];
}

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user } = useUser();
  const resolvedParams = use(params);
  const companyId = resolvedParams.id as Id<"companies">;

  const [showReferralForm, setShowReferralForm] = useState(false);
  const [editingReferralId, setEditingReferralId] =
    useState<Id<"referrals"> | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [referralFormData, setReferralFormData] = useState({
    name: "",
    linkedinUrl: "",
    email: "",
    phoneNumber: "",
    notes: "",
    tags: [] as Tag[],
  });

  const [showEditCompanyForm, setShowEditCompanyForm] = useState(false);
  const [companyFormData, setCompanyFormData] = useState({
    name: "",
    description: "",
    website: "",
  });

  // Get company details
  const company = useQuery(api.companies.getById, {
    id: companyId,
  });

  // Get referrals for this company
  const referrals = useQuery(api.referrals.listByCompany, {
    companyId,
    userId: user?.id || "",
  });

  // Mutations
  const createReferral = useMutation(api.referrals.create);
  const updateReferral = useMutation(api.referrals.update);
  const deleteReferral = useMutation(api.referrals.remove);
  const deleteCompany = useMutation(api.companies.remove);
  const updateCompany = useMutation(api.companies.update);

  const handleReferralChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setReferralFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReferralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      // Convert tags to string format for storage
      const stringTags = referralFormData.tags.map(
        (tag) => `${tag.name}|${tag.color}`
      );

      if (editingReferralId) {
        // Update existing referral
        await updateReferral({
          id: editingReferralId,
          name: referralFormData.name,
          linkedinUrl: referralFormData.linkedinUrl || undefined,
          email: referralFormData.email || undefined,
          phoneNumber: referralFormData.phoneNumber || undefined,
          notes: referralFormData.notes || undefined,
          tags: stringTags.length > 0 ? stringTags : undefined,
        });
      } else {
        // Create new referral
        await createReferral({
          companyId,
          userId: user.id,
          name: referralFormData.name,
          linkedinUrl: referralFormData.linkedinUrl || undefined,
          email: referralFormData.email || undefined,
          phoneNumber: referralFormData.phoneNumber || undefined,
          notes: referralFormData.notes || undefined,
          tags: stringTags.length > 0 ? stringTags : undefined,
        });
      }

      // Reset form
      setReferralFormData({
        name: "",
        linkedinUrl: "",
        email: "",
        phoneNumber: "",
        notes: "",
        tags: [],
      });
      setShowReferralForm(false);
      setEditingReferralId(null);
    } catch (error) {
      console.error(
        `Error ${editingReferralId ? "updating" : "creating"} referral:`,
        error
      );
    }
  };

  const startEditingReferral = (referral: {
    _id: Id<"referrals">;
    name: string;
    linkedinUrl?: string;
    email?: string;
    phoneNumber?: string;
    notes?: string;
    tags?: string[];
  }) => {
    setEditingReferralId(referral._id);

    // Parse tags from string format
    const parsedTags = (referral.tags || []).map((tagString: string) => {
      const [name, colorIndex] = tagString.split("|");
      return {
        name,
        color: parseInt(colorIndex) || 0,
      };
    });

    setReferralFormData({
      name: referral.name,
      linkedinUrl: referral.linkedinUrl || "",
      email: referral.email || "",
      phoneNumber: referral.phoneNumber || "",
      notes: referral.notes || "",
      tags: parsedTags,
    });
    setShowReferralForm(true);
  };

  const cancelEditingReferral = () => {
    setEditingReferralId(null);
    setReferralFormData({
      name: "",
      linkedinUrl: "",
      email: "",
      phoneNumber: "",
      notes: "",
      tags: [],
    });
    setShowReferralForm(false);
  };

  const handleDeleteReferral = async (referralId: Id<"referrals">) => {
    if (confirm("Are you sure you want to delete this referral?")) {
      try {
        await deleteReferral({ id: referralId });
      } catch (error) {
        console.error("Error deleting referral:", error);
      }
    }
  };

  const handleDeleteCompany = async () => {
    if (
      confirm(
        "Are you sure you want to delete this company? This will also delete all referrals."
      )
    ) {
      try {
        await deleteCompany({ id: companyId });
        // Don't call router.push here, just return to render loading state
        return true;
      } catch (error) {
        console.error("Error deleting company:", error);
        return false;
      }
    }
    return false;
  };

  const handleCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCompanyFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateCompany({
        id: companyId,
        name: companyFormData.name || undefined,
        description: companyFormData.description || undefined,
        website: companyFormData.website || undefined,
      });

      setShowEditCompanyForm(false);
    } catch (error) {
      console.error("Error updating company:", error);
    }
  };

  // Render referral progress bar with appropriate colors and glow
  const renderReferralProgressBar = (count: number) => {
    const percentage = Math.min((count / 5) * 100, 100);
    let color = "bg-orange-500";
    let showGlow = false;

    if (count >= 5) {
      color = "bg-blue-500";
      showGlow = true;
    } else if (count >= 3) {
      color = "bg-green-500";
    }

    return (
      <>
        <div
          className={`h-full rounded-full ${color}`}
          style={{
            width: `${percentage}%`,
            transition: "width 0.5s ease-in-out",
          }}
        ></div>
        {showGlow && (
          <div
            className="absolute inset-0 rounded-full bg-blue-500 opacity-70 blur-sm"
            style={{
              width: `${percentage}%`,
              boxShadow: "0 0 15px rgba(59, 130, 246, 1.0)",
            }}
          ></div>
        )}
      </>
    );
  };

  const startEditingCompany = () => {
    if (company) {
      setCompanyFormData({
        name: company.name || "",
        description: company.description || "",
        website: company.website || "",
      });
      setShowEditCompanyForm(true);
    }
  };

  // Tags handling functions
  const addTag = () => {
    if (
      newTagName.trim() &&
      !referralFormData.tags.some((tag) => tag.name === newTagName.trim())
    ) {
      setReferralFormData((prev) => ({
        ...prev,
        tags: [
          ...prev.tags,
          { name: newTagName.trim(), color: selectedColorIndex },
        ],
      }));
      setNewTagName("");
      setShowColorPicker(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setReferralFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag.name !== tagToRemove),
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const selectColor = (index: number) => {
    setSelectedColorIndex(index);
    setShowColorPicker(false);
  };

  // Parse tags for display in the referral list
  const parseTagsForDisplay = (referralTags: string[] | undefined) => {
    if (!referralTags) return [];

    return referralTags.map((tagString) => {
      const [name, colorIndex] = tagString.split("|");
      return {
        name,
        color: parseInt(colorIndex) || 0,
      };
    });
  };

  // Render tags section component
  const renderTagsSection = () => (
    <div>
      <label
        htmlFor="tags"
        className="block text-sm font-medium text-gray-300 mb-1"
      >
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {referralFormData.tags.map((tag) => (
          <div
            key={tag.name}
            className={`flex items-center ${TAG_COLORS[tag.color].bg} ${
              TAG_COLORS[tag.color].text
            } rounded-full px-3 py-1 text-sm border border-[#20253d]/50`}
          >
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={() => removeTag(tag.name)}
              className={`ml-1.5 ${
                TAG_COLORS[tag.color].text
              } hover:opacity-80 focus:outline-none cursor-pointer`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyDown={handleTagKeyPress}
          placeholder="Add a tag"
          className="bg-[#0c1029] shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-[#20253d]/50 rounded-md rounded-r-none px-3 py-2 text-white"
        />
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={`inline-flex items-center px-3 py-2 border-y border-r border-[#20253d]/50 rounded-none shadow-sm text-sm font-medium ${TAG_COLORS[selectedColorIndex].bg} ${TAG_COLORS[selectedColorIndex].text} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <span className="w-4 h-4 rounded-full mr-1"></span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {showColorPicker && (
            <div className="absolute right-0 mt-1 w-48 bg-[#0c1029] rounded-md shadow-lg z-10 border border-[#20253d]/50">
              <div className="p-2 grid grid-cols-3 gap-1">
                {TAG_COLORS.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => selectColor(index)}
                    className={`${color.bg} ${color.text} px-2 py-1 rounded text-xs font-medium flex items-center justify-between cursor-pointer border border-[#20253d]/50`}
                  >
                    {color.name}
                    {selectedColorIndex === index && (
                      <Check className="h-3 w-3" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={addTag}
          className="inline-flex items-center px-3 py-2 border-y border-r border-[#20253d]/50 rounded-r-md shadow-sm text-sm font-medium text-gray-300 bg-[#0c1029] hover:bg-[#121a36]/50 focus:outline-none cursor-pointer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // Use effect to navigate after company is loaded or deleted
  useEffect(() => {
    // Navigation logic - handle both cases:
    // 1. Company is null (doesn't exist or was deleted)
    if (company === null) {
      router.push("/dashboard");
    }
  }, [company, router]);

  // Function to organize referrals by tags
  const organizeReferralsByTags = (referrals: Referral[]) => {
    const taggedReferrals: Record<string, Referral[]> = {};
    const untaggedReferrals: Referral[] = [];

    // First pass: organize by tags
    referrals.forEach((referral) => {
      if (!referral.tags || referral.tags.length === 0) {
        untaggedReferrals.push(referral);
        return;
      }

      // Parse tags
      const parsedTags = parseTagsForDisplay(referral.tags);

      // For each tag, add the referral to that tag's list
      parsedTags.forEach((tag) => {
        const tagKey = `${tag.name}|${tag.color}`;
        if (!taggedReferrals[tagKey]) {
          taggedReferrals[tagKey] = [];
        }
        taggedReferrals[tagKey].push(referral);
      });
    });

    return { taggedReferrals, untaggedReferrals };
  };

  // Loading state
  if (!user || company === undefined || referrals === undefined) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  // If company doesn't exist or doesn't belong to user
  if (!company) {
    // Don't call router.push directly in render
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
      <div className="absolute left-0 top-0 w-1/2 h-1/2 bg-gradient-to-r from-orange-600/20 to-orange-600/5 rounded-full opacity-20 blur-[120px]"></div>
      <div className="absolute right-0 top-0 w-1/3 h-1/2 bg-blue-600/20 rounded-full opacity-20 blur-[100px]"></div>
      <div className="absolute right-1/4 bottom-0 w-1/3 h-1/3 bg-indigo-600/20 rounded-full opacity-20 blur-[80px]"></div>

      {/* Header */}
      <header className="bg-[#121a36]/50 backdrop-blur-sm shadow border-b border-[#20253d]/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center mr-4 text-gray-300 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center">
              <Link href="/dashboard">
                <h1 className="text-2xl font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300 hover:opacity-80 cursor-pointer">
                  {company.name}
                </h1>
              </Link>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleDeleteCompany}
              className="inline-flex items-center px-3 py-1.5 border border-red-700/50 shadow-sm text-sm font-medium text-red-400 bg-[#2b0a0a]/50 hover:bg-[#2b0a0a]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer rounded-md"
            >
              <Trash className="h-4 w-4 mr-2" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company info */}
        <div className="bg-[#121a36]/50 backdrop-blur-sm shadow border border-[#20253d]/50 rounded-lg p-6 mb-8">
          {showEditCompanyForm ? (
            <div>
              <h3 className="text-lg font-medium text-gray-200 mb-4">
                Edit Company
              </h3>
              <form onSubmit={handleCompanySubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Company Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={companyFormData.name}
                        onChange={handleCompanyChange}
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
                      Website
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={companyFormData.website}
                        onChange={handleCompanyChange}
                        className="block w-full sm:text-sm rounded-md px-3 py-2 
                        bg-[#0c1029] border-[#20253d] text-gray-300
                        focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. https://google.com"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
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
                        value={companyFormData.description}
                        onChange={handleCompanyChange}
                        className="block w-full sm:text-sm rounded-md px-3 py-2 
                        bg-[#0c1029] border-[#20253d] text-gray-300
                        focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Brief description of the company"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowEditCompanyForm(false)}
                    className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border-0 border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600/90 via-purple-600/80 to-blue-700/90 hover:from-orange-500 hover:via-purple-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                  >
                    Update Company
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <div className="flex items-start mb-4">
                  {/* Company Logo */}
                  <div className="w-20 h-20 mr-4 bg-gray-800/50 rounded-md flex items-center justify-center overflow-hidden">
                    {company.website && company.website.length > 0 ? (
                      <Image
                        src={`https://logo.clearbit.com/${
                          company.website
                            .replace(/^https?:\/\//, "")
                            .replace(/\/$/, "")
                            .split("/")[0]
                        }`}
                        alt={`${company.name} logo`}
                        width={80}
                        height={80}
                        className="max-w-full max-h-full object-contain p-2"
                        onError={(e) => {
                          // Show fallback icon if logo can't be loaded
                          const target = e.target as HTMLImageElement;
                          const parent = target.parentElement;
                          if (parent) {
                            // Hide the image
                            target.style.display = "none";
                            // Create and append the SVG
                            const svgElement = document.createElementNS(
                              "http://www.w3.org/2000/svg",
                              "svg"
                            );
                            svgElement.setAttribute(
                              "xmlns",
                              "http://www.w3.org/2000/svg"
                            );
                            svgElement.setAttribute(
                              "class",
                              "h-8 w-8 text-orange-400"
                            );
                            svgElement.setAttribute("fill", "none");
                            svgElement.setAttribute("viewBox", "0 0 24 24");
                            svgElement.setAttribute("stroke", "currentColor");

                            const pathElement = document.createElementNS(
                              "http://www.w3.org/2000/svg",
                              "path"
                            );
                            pathElement.setAttribute("stroke-linecap", "round");
                            pathElement.setAttribute(
                              "stroke-linejoin",
                              "round"
                            );
                            pathElement.setAttribute("stroke-width", "2");
                            pathElement.setAttribute(
                              "d",
                              "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            );

                            svgElement.appendChild(pathElement);
                            parent.appendChild(svgElement);
                          }
                        }}
                      />
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-orange-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-200 mb-2">
                      {company.name}
                    </h2>
                    {company.description && (
                      <p className="text-gray-300 mb-4">
                        {company.description}
                      </p>
                    )}
                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        <span>Visit Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-1">
                <div className="bg-[#0c1029] p-4 rounded-md border border-[#20253d]/50 relative">
                  <div className="flex flex-col items-end">
                    <p className="text-sm text-gray-400 mb-2">
                      Referrals: {referrals?.length || 0}/5
                    </p>
                    <div className="w-full h-1.5 rounded-full bg-[#090d1b] border border-[#20253d]/50 relative overflow-visible mb-4">
                      {renderReferralProgressBar(referrals?.length || 0)}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <button
                    onClick={startEditingCompany}
                    className="text-gray-400 hover:text-gray-300 transition p-1"
                    title="Edit Company"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Referrals section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <h2 className="text-xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300 relative z-10">
                Referrals
              </h2>
              <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"></div>
            </div>
            {!showReferralForm && !editingReferralId && (
              <button
                onClick={() => setShowReferralForm(true)}
                className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
              >
                <PlusCircle className="h-4 w-4 mr-2 text-orange-400" />
                {/* Add Referral for company page */}
                Add Referral
              </button>
            )}
          </div>

          {/* Referral form */}
          {(showReferralForm || editingReferralId) && (
            <div className="bg-[#121a36]/50 backdrop-blur-sm shadow border border-[#20253d]/50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-light text-gray-200 mb-4">
                {editingReferralId ? "Edit Referral" : "Add Referral"}
              </h3>
              <form onSubmit={handleReferralSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Name *
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={referralFormData.name}
                        onChange={handleReferralChange}
                        className="block w-full sm:text-sm rounded-md px-3 py-2 
                        bg-[#0c1029] border-[#20253d] text-gray-300
                        focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Contact name"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="linkedinUrl"
                      className="block text-sm font-medium text-gray-300"
                    >
                      LinkedIn URL
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        id="linkedinUrl"
                        name="linkedinUrl"
                        value={referralFormData.linkedinUrl}
                        onChange={handleReferralChange}
                        className="block w-full sm:text-sm rounded-md px-3 py-2 
                        bg-[#0c1029] border-[#20253d] text-gray-300
                        focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={referralFormData.email}
                        onChange={handleReferralChange}
                        className="block w-full sm:text-sm rounded-md px-3 py-2 
                        bg-[#0c1029] border-[#20253d] text-gray-300
                        focus:ring-blue-500 focus:border-blue-500"
                        placeholder="contact@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Phone Number
                    </label>
                    <div className="mt-1">
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={referralFormData.phoneNumber}
                        onChange={handleReferralChange}
                        className="block w-full sm:text-sm rounded-md px-3 py-2 
                        bg-[#0c1029] border-[#20253d] text-gray-300
                        focus:ring-blue-500 focus:border-blue-500"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-gray-300"
                    >
                      Notes
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={referralFormData.notes}
                        onChange={handleReferralChange}
                        className="block w-full sm:text-sm rounded-md px-3 py-2 
                        bg-[#0c1029] border-[#20253d] text-gray-300
                        focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any additional information about this contact"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">{renderTagsSection()}</div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={
                      editingReferralId
                        ? cancelEditingReferral
                        : () => setShowReferralForm(false)
                    }
                    className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3 cursor-pointer"
                  >
                    Cancel
                  </button>
                  {/* Button to add referral */}
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border-0 border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-orange-600/90 via-purple-600/80 to-blue-700/90 hover:from-orange-500 hover:via-purple-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.5)] "
                  >
                    {editingReferralId ? "Update" : "Add"} Referral
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Referrals list */}
          {referrals.length === 0 ? (
            <div className="text-center py-16 bg-[#121a36]/50 backdrop-blur-sm shadow rounded-lg border border-[#20253d]/50">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-light text-white">
                No referrals yet
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Add your first referral contact.
              </p>
              {!showReferralForm && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowReferralForm(true)}
                    className="inline-flex items-center px-4 py-2 border border-[#20253d]/50 shadow-sm text-sm font-medium text-gray-300 bg-[#121a36]/50 hover:bg-[#121a36]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer backdrop-blur-sm"
                  >
                    <PlusCircle className="h-4 w-4 mr-2 text-orange-400" />
                    Add Referral
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Organize referrals by tags */}
              {(() => {
                const { taggedReferrals, untaggedReferrals } =
                  organizeReferralsByTags(referrals);
                const tagKeys = Object.keys(taggedReferrals);

                return (
                  <>
                    {/* Untagged referrals - displayed at the top without label */}
                    {untaggedReferrals.length > 0 && (
                      <div className="mb-6">
                        <div className="space-y-4">
                          {untaggedReferrals.map((referral) => (
                            <div
                              key={referral._id}
                              className="bg-[#121a36]/50 backdrop-blur-sm shadow border border-[#20253d]/50 rounded-lg p-6 hover:border-[#20253d] transition-all duration-300"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start">
                                  <User className="h-10 w-10 text-gray-400 mr-4 bg-[#0c1029] p-2 rounded-full border border-[#20253d]/50" />
                                  <div>
                                    <h4 className="text-lg font-medium text-gray-200">
                                      {referral.name}
                                    </h4>
                                    {referral.linkedinUrl && (
                                      <a
                                        href={referral.linkedinUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 text-sm text-blue-400 hover:text-blue-300 inline-flex items-center cursor-pointer"
                                      >
                                        LinkedIn Profile
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                                <div className="flex">
                                  <button
                                    onClick={() =>
                                      startEditingReferral(referral)
                                    }
                                    className="text-gray-400 hover:text-gray-300 mr-2 p-1"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteReferral(referral._id)
                                    }
                                    className="text-red-400 hover:text-red-300 p-1"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              {(referral.email || referral.phoneNumber) && (
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {referral.email && (
                                    <div className="flex items-center text-sm text-gray-400">
                                      <span className="font-medium mr-2">
                                        Email:
                                      </span>
                                      <span>{referral.email}</span>
                                    </div>
                                  )}
                                  {referral.phoneNumber && (
                                    <div className="flex items-center text-sm text-gray-400">
                                      <span className="font-medium mr-2">
                                        Phone:
                                      </span>
                                      <span>{referral.phoneNumber}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                              {referral.notes && (
                                <div className="mt-4 pt-4 border-t border-[#20253d]/50">
                                  <h5 className="text-sm font-medium text-gray-300 mb-1">
                                    Notes:
                                  </h5>
                                  <p className="text-sm text-gray-400">
                                    {referral.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tagged referrals */}
                    {tagKeys.map((tagKey) => {
                      const [name, colorIndex] = tagKey.split("|");
                      const color = parseInt(colorIndex);
                      const referralsForTag = taggedReferrals[tagKey];

                      return (
                        <div key={tagKey} className="mb-6">
                          <div className="flex items-center mb-3">
                            <span
                              className={`px-3 py-1 text-sm ${TAG_COLORS[color].bg} ${TAG_COLORS[color].text} rounded-full border border-[#20253d]/70`}
                            >
                              {name}
                            </span>
                            <span className="ml-2 text-gray-400 text-sm">
                              {referralsForTag.length} referral
                              {referralsForTag.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="space-y-4">
                            {referralsForTag.map((referral) => (
                              <div
                                key={referral._id}
                                className="bg-[#121a36]/50 backdrop-blur-sm shadow border border-[#20253d]/50 rounded-lg p-6 hover:border-[#20253d] transition-all duration-300"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start">
                                    <User className="h-10 w-10 text-gray-400 mr-4 bg-[#0c1029] p-2 rounded-full border border-[#20253d]/50" />
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-lg font-medium text-gray-200">
                                          {referral.name}
                                        </h4>
                                        {referral.tags &&
                                          referral.tags.length > 0 &&
                                          parseTagsForDisplay(
                                            referral.tags
                                          ).map((tag) => (
                                            <span
                                              key={tag.name}
                                              className={`px-2 py-0.5 text-xs ${
                                                TAG_COLORS[tag.color].bg
                                              } ${
                                                TAG_COLORS[tag.color].text
                                              } rounded-full border border-[#20253d]/70`}
                                            >
                                              {tag.name}
                                            </span>
                                          ))}
                                      </div>
                                      {referral.linkedinUrl && (
                                        <a
                                          href={referral.linkedinUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="mt-1 text-sm text-blue-400 hover:text-blue-300 inline-flex items-center cursor-pointer"
                                        >
                                          LinkedIn Profile
                                          <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex">
                                    <button
                                      onClick={() =>
                                        startEditingReferral(referral)
                                      }
                                      className="text-gray-400 hover:text-gray-300 mr-2 p-1"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteReferral(referral._id)
                                      }
                                      className="text-red-400 hover:text-red-300 p-1"
                                    >
                                      <Trash className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                {(referral.email || referral.phoneNumber) && (
                                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {referral.email && (
                                      <div className="flex items-center text-sm text-gray-400">
                                        <span className="font-medium mr-2">
                                          Email:
                                        </span>
                                        <span>{referral.email}</span>
                                      </div>
                                    )}
                                    {referral.phoneNumber && (
                                      <div className="flex items-center text-sm text-gray-400">
                                        <span className="font-medium mr-2">
                                          Phone:
                                        </span>
                                        <span>{referral.phoneNumber}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {referral.notes && (
                                  <div className="mt-4 pt-4 border-t border-[#20253d]/50">
                                    <h5 className="text-sm font-medium text-gray-300 mb-1">
                                      Notes:
                                    </h5>
                                    <p className="text-sm text-gray-400">
                                      {referral.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
