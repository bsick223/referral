"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import SettingsTabs from "@/components/SettingsTabs";
import ContactForm from "@/components/ContactUsForm";

export default function ContactSettingsPage() {
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
      <SettingsTabs activeTab="contact" />

      {/* Contact Form */}
      <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50">
        <div className="p-6 border-b border-[#20253d]/50">
          <h2 className="text-xl font-light text-white">Contact Us</h2>
          <p className="text-gray-400 text-sm mt-1">
            Have questions or feedback? Reach out to our team
          </p>
        </div>

        <div className="p-6">
          {/* Wrap the contact form in a styled container for dark theme */}
          <div className="bg-[#0c1029]/70 rounded-lg p-6 border border-[#20253d]/80">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
