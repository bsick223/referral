"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import React from "react";

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">
            Last Updated: March 25, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Introduction
            </h2>
            <p className="mb-4">
              This Privacy Policy describes how we collect, use, process, and
              disclose your information, including personal information, in
              conjunction with your access to and use of our application.
            </p>
            <p className="mb-4">
              By using our service, you acknowledge that you have read and
              understand this Privacy Policy. If you do not agree with our
              policies and practices, please do not use our application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Information We Collect
            </h2>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">
              Information You Provide to Us
            </h3>
            <p className="mb-4">
              When you register for an account, we collect the following
              information through our authentication provider (Clerk):
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Profile information you choose to share</li>
              <li>Authentication method preferences</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">
              Information We Collect Automatically
            </h3>
            <p className="mb-4">
              We automatically collect certain types of information when you use
              our application:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                Log and usage data (pages visited, time spent, features used)
              </li>
              <li>
                Device information (browser type, operating system, device type)
              </li>
              <li>IP address and approximate location (country/region)</li>
            </ul>

            <h3 className="text-lg font-medium text-white mt-6 mb-3">
              Third-Party Services
            </h3>
            <p className="mb-4">
              Our application integrates with the following third-party services
              that may collect information:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                Clerk: Provides authentication and user management services.
                Please refer to Clerk&apos;s Privacy Policy for details on their
                data practices.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              How We Use Your Information
            </h2>
            <p className="mb-4">
              We use your information for the following purposes:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>To provide, maintain, and improve our services</li>
              <li>To authenticate your identity and manage your account</li>
              <li>To personalize your experience</li>
              <li>
                To communicate with you about service-related announcements
              </li>
              <li>
                To analyze usage patterns and optimize application performance
              </li>
              <li>
                To detect, prevent, and address technical issues or security
                threats
              </li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Data Retention
            </h2>
            <p className="mb-4">
              We retain your personal information only for as long as necessary
              to fulfill the purposes outlined in this Privacy Policy, unless a
              longer retention period is required or permitted by law.
            </p>
            <p className="mb-4">
              Your account information is retained while your account remains
              active. If you request deletion of your account, we will delete or
              anonymize your information, except where we must retain
              information to comply with legal obligations, resolve disputes, or
              enforce our agreements.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Your Rights and Choices
            </h2>
            <p className="mb-4">
              Depending on your location, you may have certain rights regarding
              your personal information:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                Access and Portability: You may request access to the personal
                information we hold about you and request a copy in a
                structured, commonly used format.
              </li>
              <li>
                Correction: You may request that we correct inaccurate or
                incomplete information about you.
              </li>
              <li>
                Deletion: You may request that we delete your personal
                information, subject to certain exceptions.
              </li>
              <li>
                Restriction and Objection: You may request that we restrict
                processing of your information or object to certain types of
                processing.
              </li>
              <li>
                Withdrawal of Consent: Where we rely on consent as the legal
                basis for processing, you may withdraw consent at any time.
              </li>
            </ul>
            <p className="mb-4">
              To exercise these rights, please contact us using the information
              provided in the &quot;Contact Us&quot; section below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Data Security
            </h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction.
            </p>
            <p className="mb-4">
              However, no method of transmission over the Internet or electronic
              storage is 100% secure. While we strive to use commercially
              acceptable means to protect your personal information, we cannot
              guarantee its absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Cookies and Tracking Technologies
            </h2>
            <p className="mb-4">
              Our application and third-party services may use cookies, local
              storage, and similar technologies to enhance your experience and
              collect information about how you use our application.
            </p>
            <p className="mb-4">
              Clerk, our authentication provider, uses cookies to maintain your
              authentication state and provide secure access to our application.
            </p>
            <p className="mb-4">
              You can control cookies through your browser settings, but
              disabling certain cookies may limit your ability to use some
              features of our application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              International Data Transfers
            </h2>
            <p className="mb-4">
              Your information may be transferred to, and maintained on,
              computers located outside of your state, province, country, or
              other governmental jurisdiction where the data protection laws may
              differ. If you are located outside the United States and choose to
              provide information to us, please note that we transfer the data
              to the United States and process it there. Your consent to this
              Privacy Policy followed by your submission of such information
              represents your agreement to this transfer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Children&apos;s Privacy
            </h2>
            <p className="mb-4">
              Our service is not directed to individuals under 16. We do not
              knowingly collect personal information from children under 16. If
              we learn that we have collected personal information of a child
              under 16, we will take steps to delete such information as quickly
              as possible. If you believe we might have any information from or
              about a child under 16, please contact us.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              California Resident Notice at Collection
            </h2>
            <p className="mb-4">
              If you are a California resident, the California Consumer Privacy
              Act, as amended by the California Privacy Rights Act of 2020
              (&quot;CCPA&quot;), requires us to provide some additional
              information to California residents. This section only applies to
              you if you are a California resident, although please note that
              this information and the rights afforded herein are the same as
              offered to our other users in our main Privacy Policy.
            </p>
            <p className="mb-4">
              Please see the &quot;Your Rights and Choices&quot; section of our
              Policy above for information about the additional rights you have
              with respect to your personal information under California law and
              how to exercise them.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="mb-4">
              We may update this policy as needed to comply with relevant
              regulations and reflect any new practices. Whenever we make a
              significant change to our policies, we will refresh the date at
              the top of this page. You are advised to review this Privacy
              Policy periodically for any changes. Changes to this Privacy
              Policy are effective when they are posted on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Contact Us
            </h2>
            <p className="mb-4">
              Have any questions, comments, or concerns about this privacy
              policy, your data, or your rights with respect to your
              information? Please get in touch by emailing us at
              apptrackedbrendan@gmail.com and we&apos;ll be happy to try to
              answer them!
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              For European Economic Area Residents
            </h2>
            <p className="mb-4">
              If you are located in the European Economic Area (EEA), you have
              certain rights under the General Data Protection Regulation
              (GDPR). The data controller of your personal information is App
              Tracked.
            </p>
            <p className="mb-4">
              The legal bases we rely on for processing your information
              include: contractual necessity, consent, legitimate interests, and
              legal obligation.
            </p>
            <p className="mb-4">
              You have the right to lodge a complaint with a supervisory
              authority in the EEA if you believe our processing of your
              personal information violates applicable law.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
