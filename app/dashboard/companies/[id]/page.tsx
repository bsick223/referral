"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Building,
  ArrowLeft,
  PlusCircle,
  User,
  Trash,
  RefreshCw,
  ExternalLink,
  Pencil,
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { Id } from "@/convex/_generated/dataModel";
import { use } from "react";

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
  const [referralFormData, setReferralFormData] = useState({
    name: "",
    linkedinUrl: "",
    email: "",
    phoneNumber: "",
    notes: "",
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
      if (editingReferralId) {
        // Update existing referral
        await updateReferral({
          id: editingReferralId,
          name: referralFormData.name,
          linkedinUrl: referralFormData.linkedinUrl,
          email: referralFormData.email || undefined,
          phoneNumber: referralFormData.phoneNumber || undefined,
          notes: referralFormData.notes || undefined,
        });
      } else {
        // Create new referral
        await createReferral({
          companyId,
          userId: user.id,
          name: referralFormData.name,
          linkedinUrl: referralFormData.linkedinUrl,
          email: referralFormData.email || undefined,
          phoneNumber: referralFormData.phoneNumber || undefined,
          notes: referralFormData.notes || undefined,
        });
      }

      // Reset form
      setReferralFormData({
        name: "",
        linkedinUrl: "",
        email: "",
        phoneNumber: "",
        notes: "",
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

  const startEditingReferral = (referral: any) => {
    setEditingReferralId(referral._id);
    setReferralFormData({
      name: referral.name,
      linkedinUrl: referral.linkedinUrl,
      email: referral.email || "",
      phoneNumber: referral.phoneNumber || "",
      notes: referral.notes || "",
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
        router.push("/dashboard");
      } catch (error) {
        console.error("Error deleting company:", error);
      }
    }
  };

  // Loading state
  if (!user || company === undefined || referrals === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Company not found
  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Building className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700">
          Company not found
        </h2>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center mr-4 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
          </div>
          <button
            onClick={handleDeleteCompany}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete Company
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Company info */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Company Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="mt-1 text-md text-gray-800">{company.name}</p>
                </div>
                {company.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Description
                    </p>
                    <p className="mt-1 text-md text-gray-800">
                      {company.description}
                    </p>
                  </div>
                )}
                {company.website && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Website</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-md text-blue-600 hover:underline inline-flex items-center cursor-pointer"
                    >
                      {company.website}
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date Added
                  </p>
                  <p className="mt-1 text-md text-gray-800">
                    {new Date(company.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Referrals
                  </p>
                  <p className="mt-1 text-md text-gray-800">
                    {referrals.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referrals section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Referrals</h2>
          {!showReferralForm && (
            <button
              onClick={() => {
                setShowReferralForm(true);
                setEditingReferralId(null);
                setReferralFormData({
                  name: "",
                  linkedinUrl: "",
                  email: "",
                  phoneNumber: "",
                  notes: "",
                });
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Referral
            </button>
          )}
        </div>

        {/* Referral Form (New or Edit) */}
        {showReferralForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingReferralId ? "Edit Referral" : "Add New Referral"}
            </h3>
            <form onSubmit={handleReferralSubmit}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                      placeholder="Contact name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="linkedinUrl"
                    className="block text-sm font-medium text-gray-700"
                  >
                    LinkedIn URL *
                  </label>
                  <div className="mt-1">
                    <input
                      type="url"
                      id="linkedinUrl"
                      name="linkedinUrl"
                      required
                      value={referralFormData.linkedinUrl}
                      onChange={handleReferralChange}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700"
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
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2"
                      placeholder="Any additional information"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={cancelEditingReferral}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    !referralFormData.name || !referralFormData.linkedinUrl
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer"
                >
                  {editingReferralId ? "Save Changes" : "Add Referral"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Referrals List */}
        {referrals.length === 0 ? (
          <div className="text-center py-16 bg-white shadow rounded-lg">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No referrals yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding people who can refer you to {company.name}.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowReferralForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Referral
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {referrals.map((referral) => (
                <li key={referral._id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {referral.name}
                      </h3>
                      <div className="mt-1 space-y-1">
                        {referral.email && (
                          <p className="text-sm text-gray-500">
                            Email: {referral.email}
                          </p>
                        )}
                        {referral.phoneNumber && (
                          <p className="text-sm text-gray-500">
                            Phone: {referral.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <a
                        href={referral.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        LinkedIn
                      </a>
                      <button
                        onClick={() => startEditingReferral(referral)}
                        className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                        title="Edit referral"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReferral(referral._id)}
                        className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-500 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                        title="Delete referral"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {referral.notes && (
                    <div className="mt-3 text-sm text-gray-600">
                      <p className="font-medium text-gray-500 mb-1">Notes:</p>
                      <p>{referral.notes}</p>
                    </div>
                  )}
                  <div className="mt-3 text-xs text-gray-500">
                    Added {new Date(referral.createdAt).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
