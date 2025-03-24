"use client";

import { useEffect, useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { redirect, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart4,
  LineChart,
  PieChart,
  Activity,
  Calendar,
  Clock,
} from "lucide-react";
import Image from "next/image";

interface TimeframeToggleProps {
  active: string;
  setActive: (timeframe: string) => void;
}

// Component for the chart toggle buttons
const TimeframeToggle = ({ active, setActive }: TimeframeToggleProps) => {
  const options = [
    { id: "24h", label: "24h", icon: <Clock className="h-4 w-4" /> },
    { id: "weekly", label: "Weekly", icon: <Calendar className="h-4 w-4" /> },
    {
      id: "monthly",
      label: "Monthly",
      icon: <BarChart4 className="h-4 w-4" />,
    },
    { id: "all", label: "All Time", icon: <Activity className="h-4 w-4" /> },
  ];

  return (
    <div className="flex space-x-2 mb-6">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => setActive(option.id)}
          className={`flex items-center px-4 py-2 rounded-md ${
            active === option.id
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {option.icon}
          <span className="ml-2">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

interface ChartItem {
  date?: string;
  label?: string;
  count: number;
}

interface BarChartProps {
  data: ChartItem[];
  label: string;
}

// Horizontal bar chart component
const BarChart = ({ data, label }: BarChartProps) => {
  const maxValue = Math.max(...data.map((item) => item.count), 1);
  const maxYAxisLabel = Math.ceil(maxValue * 1.1); // Add 10% for y-axis scale

  // Generate y-axis labels
  const yAxisLabels = [];
  const stepSize = Math.ceil(maxYAxisLabel / 5); // Divide into 5 steps

  for (let i = 0; i <= maxYAxisLabel; i += stepSize) {
    yAxisLabels.push(i);
  }

  if (!yAxisLabels.includes(maxYAxisLabel)) {
    yAxisLabels.push(maxYAxisLabel);
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{label}</h3>

      <div className="flex">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between pr-2 w-10 text-right text-xs text-gray-500">
          {yAxisLabels.map((value, index) => (
            <div key={index}>{value}</div>
          ))}
        </div>

        {/* Y-axis line */}
        <div className="w-px bg-gray-300 mr-4"></div>

        {/* Chart bars */}
        <div className="flex-1">
          <div className="space-y-6">
            {data.map((item, index) => (
              <div key={index} className="relative">
                <div className="text-sm text-gray-600 mb-1">
                  {item.label || item.date}
                </div>
                <div className="h-8 bg-gray-100 rounded-md relative">
                  <div
                    className="absolute left-0 top-0 h-8 bg-blue-500 rounded-md transition-all duration-500"
                    style={{ width: `${(item.count / maxYAxisLabel) * 100}%` }}
                  ></div>
                  <div className="absolute left-2 top-0 h-8 flex items-center text-white font-medium text-sm">
                    {item.count > 0 && item.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* X-axis line */}
      <div className="ml-14 h-px bg-gray-300 mt-2"></div>

      {/* Labels */}
      <div className="ml-14 flex justify-between mt-1">
        <div className="text-xs text-gray-500">0</div>
        <div className="text-xs text-gray-500">{maxYAxisLabel}</div>
      </div>
    </div>
  );
};

interface Activity {
  id: string;
  name: string;
  status: string;
  date: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

// Recent Activity component
const RecentActivity = ({ activities }: RecentActivityProps) => {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    contacted: "bg-blue-100 text-blue-800",
    interested: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    hired: "bg-purple-100 text-purple-800",
  };

  return (
    <div>
      {activities.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No recent activity</div>
      ) : (
        <div className="rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      statusColors[activity.status.toLowerCase()] ||
                      "bg-gray-100 text-gray-800"
                    } capitalize`}
                  >
                    {activity.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Pie chart component for company breakdown
interface CompanyData {
  companyId: string;
  companyName: string;
  referralCount: number;
  percentage: number;
}

interface CompanyPieChartProps {
  data: CompanyData[];
  totalReferrals: number;
}

const CompanyPieChart = ({ data, totalReferrals }: CompanyPieChartProps) => {
  // Generate colors for the pie chart slices
  const colorPalette = [
    "#3b82f6", // blue-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#ec4899", // pink-500
    "#6366f1", // indigo-500
    "#14b8a6", // teal-500
    "#f97316", // orange-500
    "#84cc16", // lime-500
  ];

  // Calculate the cumulative percentages for positioning the pie slices
  let cumulativePercentage = 0;
  const pieSlices = data.map((company, index) => {
    const startPercentage = cumulativePercentage;
    cumulativePercentage += company.percentage;

    return {
      ...company,
      color: colorPalette[index % colorPalette.length],
      startPercentage,
      endPercentage: cumulativePercentage,
    };
  });

  return (
    <div>
      <div className="relative w-64 h-64 mx-auto mb-8">
        {/* Render pie chart */}
        <div className="w-full h-full rounded-full overflow-hidden relative">
          {pieSlices.map((slice, index) => {
            const startAngle = (slice.startPercentage / 100) * 360;
            const endAngle = (slice.endPercentage / 100) * 360;

            return (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  background: `conic-gradient(transparent ${startAngle}deg, ${slice.color} ${startAngle}deg, ${slice.color} ${endAngle}deg, transparent ${endAngle}deg)`,
                }}
              />
            );
          })}

          {/* Center circle (white) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalReferrals}</div>
              <div className="text-sm text-gray-500">Total Referrals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {pieSlices.map((slice, index) => (
          <div key={index} className="flex items-center">
            <div
              className="w-4 h-4 rounded-full mr-2"
              style={{ backgroundColor: slice.color }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{slice.companyName}</span>
              <div className="flex items-center text-xs text-gray-500">
                <span>{slice.referralCount} referrals</span>
                <span className="mx-1">•</span>
                <span>{Math.round(slice.percentage)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || user?.id;

  const [activeTimeframe, setActiveTimeframe] = useState("weekly");

  // Redirect if not authenticated
  if (isLoaded && !isSignedIn) {
    redirect("/");
  }

  // Fetch analytics data
  const analytics = useQuery(api.referrals.getUserReferralAnalytics, {
    userId: userId || "",
  });

  // Fetch company distribution data
  const companyDistribution = useQuery(
    api.referrals.getUserReferralsByCompany,
    {
      userId: userId || "",
    }
  );

  interface LeaderboardEntry {
    userId: string;
    name: string;
    referralCount: number;
  }

  // User info
  const userInfo = useQuery(api.referrals.getLeaderboard, { limit: 10 });
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    if (userInfo && userId) {
      const entry = userInfo.find((entry) => entry.userId === userId);
      if (entry) {
        setUserEntry(entry);
      }
    }
  }, [userInfo, userId]);

  // Fix the leaderboard ranking calculation with proper type safety
  const leaderboardRank = useMemo(() => {
    if (userInfo && userEntry && userInfo.findIndex) {
      const index = userInfo.findIndex(
        (entry) => entry.userId === userEntry.userId
      );
      return index !== -1 ? index + 1 : null;
    }
    return null;
  }, [userInfo, userEntry]);

  if (!analytics || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Determine which data to show based on active timeframe
  const getChartData = () => {
    switch (activeTimeframe) {
      case "24h":
        // Just show today and yesterday for the 24h view
        return analytics.dailyData.slice(-2);
      case "weekly":
        return analytics.dailyData;
      case "monthly":
        return analytics.weeklyData;
      case "all":
        return analytics.monthlyData;
      default:
        return analytics.weeklyData;
    }
  };

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-6">
          <Link
            href="/leaderboard"
            className="flex items-center text-blue-600 hover:text-blue-800 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Leaderboard</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Referral Analytics
          </h1>
        </div>

        {/* Overview Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 bg-blue-600">
            <h3 className="text-xl font-bold text-white">
              Your Referral Statistics
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="flex-1">
                <div className="text-4xl font-bold text-blue-600">
                  {analytics.totalReferrals}
                </div>
                <div className="text-gray-600">Total Referrals</div>
              </div>

              {userEntry && (
                <div className="flex-1 text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    #{leaderboardRank || "-"}
                  </div>
                  <div className="text-gray-600">Leaderboard Rank</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 bg-blue-600">
            <h3 className="text-xl font-bold text-white">Referral Growth</h3>
          </div>
          <div className="p-6">
            <TimeframeToggle
              active={activeTimeframe}
              setActive={setActiveTimeframe}
            />

            {chartData.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No data available for this time period
              </div>
            ) : (
              <BarChart
                data={chartData}
                label={
                  activeTimeframe === "24h"
                    ? "Last 24 Hours"
                    : activeTimeframe === "weekly"
                    ? "Last 7 Days"
                    : activeTimeframe === "monthly"
                    ? "Last 12 Weeks"
                    : "Last 12 Months"
                }
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Distribution */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-blue-600">
              <h3 className="text-xl font-bold text-white">
                Referrals by Company
              </h3>
            </div>
            <div className="p-6">
              {!companyDistribution ||
              !companyDistribution.companiesData ||
              companyDistribution.companiesData.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No company data available
                </div>
              ) : (
                <CompanyPieChart
                  data={companyDistribution.companiesData}
                  totalReferrals={companyDistribution.totalReferrals}
                />
              )}
            </div>
          </div>

          {/* Referral Success Rate */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-blue-600">
              <h3 className="text-xl font-bold text-white">
                Referral Success Rate
              </h3>
            </div>
            <div className="p-6">
              {!analytics || !analytics.statusBreakdown ? (
                <div className="text-center text-gray-500 py-10">
                  No status data available
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  {/* Calculate success rate from statusBreakdown */}
                  {(() => {
                    const statusBreakdown = analytics.statusBreakdown as Record<
                      string,
                      number
                    >;
                    const accepted = statusBreakdown["Accepted"] || 0;
                    const total = Object.values(statusBreakdown).reduce(
                      (sum, count) => sum + count,
                      0
                    );
                    const successRate =
                      total > 0 ? (accepted / total) * 100 : 0;

                    return (
                      <>
                        <div className="relative w-40 h-40 mb-4">
                          {/* Background circle */}
                          <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>

                          {/* Progress circle */}
                          <div
                            className="absolute inset-0 rounded-full border-8 border-green-500"
                            style={{
                              clipPath: `polygon(50% 50%, 50% 0%, ${
                                successRate <= 25
                                  ? `${
                                      50 +
                                      50 *
                                        Math.sin(
                                          ((successRate / 25) * Math.PI) / 2
                                        )
                                    }% ${
                                      50 -
                                      50 *
                                        Math.cos(
                                          ((successRate / 25) * Math.PI) / 2
                                        )
                                    }%`
                                  : successRate <= 50
                                  ? `100% 0%, 100% ${
                                      50 -
                                      50 *
                                        Math.cos(
                                          (((successRate - 25) / 25) *
                                            Math.PI) /
                                            2
                                        )
                                    }%`
                                  : successRate <= 75
                                  ? `100% 0%, 100% 100%, ${
                                      50 +
                                      50 *
                                        Math.cos(
                                          (((successRate - 50) / 25) *
                                            Math.PI) /
                                            2
                                        )
                                    }% 100%`
                                  : `100% 0%, 100% 100%, 0% 100%, 0% ${
                                      50 +
                                      50 *
                                        Math.sin(
                                          (((successRate - 75) / 25) *
                                            Math.PI) /
                                            2
                                        )
                                    }%`
                              })`,
                            }}
                          ></div>

                          {/* Center text */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-3xl font-bold">
                                {Math.round(successRate)}%
                              </div>
                              <div className="text-sm text-gray-500">
                                Success Rate
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="mb-2">
                            <span className="text-sm font-medium">
                              {accepted} accepted
                            </span>
                            <span className="mx-2 text-gray-400">of</span>
                            <span className="text-sm font-medium">
                              {total} total referrals
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600">
            <h3 className="text-xl font-bold text-white">Recent Activity</h3>
          </div>
          <div className="p-6">
            {!analytics ||
            !analytics.recentActivity ||
            analytics.recentActivity.length === 0 ? (
              <div className="text-center text-gray-500 py-10">
                No recent activity
              </div>
            ) : (
              <RecentActivity activities={analytics.recentActivity} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
