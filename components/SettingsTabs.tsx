"use client";

import React from "react";
import Link from "next/link";
import { User, Lock, Mail } from "lucide-react";

interface SettingsTabsProps {
  activeTab: "profile" | "privacy" | "contact";
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ activeTab }) => {
  const tabs = [
    {
      id: "profile",
      name: "Profile Settings",
      icon: User,
      href: "/settings",
    },
    {
      id: "privacy",
      name: "Privacy Settings",
      icon: Lock,
      href: "/settings/privacy",
    },
    {
      id: "contact",
      name: "Contact Us",
      icon: Mail,
      href: "/settings/contact",
    },
  ];

  return (
    <div className="mb-6">
      <div className="border-b border-[#20253d]/50">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`group flex items-center py-4 px-1 border-b-2 font-medium text-sm 
                  ${
                    isActive
                      ? "border-blue-500 text-blue-400"
                      : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700"
                  }
                  transition-colors duration-200`}
              >
                <tab.icon
                  className={`mr-2 h-5 w-5 ${
                    isActive
                      ? "text-blue-400"
                      : "text-gray-400 group-hover:text-gray-300"
                  }`}
                />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SettingsTabs;
