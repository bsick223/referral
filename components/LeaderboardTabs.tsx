import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Medal, Briefcase } from "lucide-react";

interface LeaderboardTabsProps {
  activeTab: "aura" | "applications" | "referrals";
  setActiveTab: (tab: "aura" | "applications" | "referrals") => void;
}

const LeaderboardTabs: React.FC<LeaderboardTabsProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row bg-[#121a36]/30 rounded-xl p-2 backdrop-blur-sm border border-[#20253d]/50 relative overflow-hidden">
        {/* Background glow based on active tab */}
        <motion.div
          className="absolute inset-0 opacity-20"
          initial={false}
          animate={{
            background:
              activeTab === "aura"
                ? "radial-gradient(circle, rgba(249,115,22,0.3) 0%, rgba(249,115,22,0) 70%)"
                : activeTab === "applications"
                ? "radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0) 70%)"
                : "radial-gradient(circle, rgba(168,85,247,0.3) 0%, rgba(168,85,247,0) 70%)",
          }}
          transition={{ duration: 0.5 }}
        />

        {/* Animated selection indicator */}
        <motion.div
          className="absolute rounded-lg bg-gradient-to-r h-full sm:w-1/3 -z-1"
          initial={false}
          animate={{
            left:
              activeTab === "aura"
                ? "0%"
                : activeTab === "applications"
                ? "33.333%"
                : "66.666%",
            background:
              activeTab === "aura"
                ? "linear-gradient(90deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.05) 100%)"
                : activeTab === "applications"
                ? "linear-gradient(90deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 100%)"
                : "linear-gradient(90deg, rgba(168,85,247,0.15) 0%, rgba(168,85,247,0.05) 100%)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            top: 0,
            width: "33.333%",
          }}
        />

        {/* Tab buttons */}
        <button
          onClick={() => setActiveTab("aura")}
          className={`flex-1 py-3 px-4 rounded-lg relative z-10 transition-colors flex items-center justify-center gap-2 ${
            activeTab === "aura"
              ? "text-orange-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <Sparkles
            className={`h-4 w-4 ${
              activeTab === "aura" ? "text-orange-400" : "text-gray-500"
            }`}
          />
          <span className="font-medium">Aura</span>
        </button>

        <button
          onClick={() => setActiveTab("applications")}
          className={`flex-1 py-3 px-4 rounded-lg relative z-10 transition-colors flex items-center justify-center gap-2 ${
            activeTab === "applications"
              ? "text-blue-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <Briefcase
            className={`h-4 w-4 ${
              activeTab === "applications" ? "text-blue-400" : "text-gray-500"
            }`}
          />
          <span className="font-medium">Applications</span>
        </button>

        <button
          onClick={() => setActiveTab("referrals")}
          className={`flex-1 py-3 px-4 rounded-lg relative z-10 transition-colors flex items-center justify-center gap-2 ${
            activeTab === "referrals"
              ? "text-purple-400"
              : "text-gray-400 hover:text-gray-300"
          }`}
        >
          <Medal
            className={`h-4 w-4 ${
              activeTab === "referrals" ? "text-purple-400" : "text-gray-500"
            }`}
          />
          <span className="font-medium">Referrals</span>
        </button>
      </div>
    </div>
  );
};

export default LeaderboardTabs;
