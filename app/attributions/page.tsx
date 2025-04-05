"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React from "react";

export default function Attributions() {
  return (
    <div className="min-h-screen bg-[#090d1b] text-gray-300">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </div>

        <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Attributions</h1>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Logo.dev:</h2>
            <p className="mb-4">
              <a
                href="https://logo.dev"
                alt="Logo API"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Logos provided by Logo.dev
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
