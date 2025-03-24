"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, Calendar, History } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";

// Time period types for the chart
type TimePeriod = "weekly" | "monthly" | "all";

// Create a separate client component that uses useSearchParams
function AnalyticsContent() {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || user?.id;
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("weekly");

  // Fetch analytics data from Convex
  const analytics = useQuery(api.referrals.getUserReferralAnalytics, {
    userId: userId || "",
  });

  // Sample data structure (for preview purposes)
  const sampleData = {
    weekly: [
      { day: "Mon", count: 5 },
      { day: "Tue", count: 8 },
      { day: "Wed", count: 12 },
      { day: "Thu", count: 7 },
      { day: "Fri", count: 10 },
      { day: "Sat", count: 4 },
      { day: "Sun", count: 3 },
    ],
    monthly: [
      { day: "Week 1", count: 32 },
      { day: "Week 2", count: 41 },
      { day: "Week 3", count: 29 },
      { day: "Week 4", count: 38 },
    ],
    all: [
      { day: "Jan", count: 120 },
      { day: "Feb", count: 145 },
      { day: "Mar", count: 168 },
      { day: "Apr", count: 210 },
      { day: "May", count: 189 },
      { day: "Jun", count: 225 },
    ],
  };

  // Process analytics data to match expected format
  const processAnalyticsData = () => {
    if (!analytics) return { chartData: sampleData, totals: defaultTotals };

    // Map the data from the API to the format we need
    const chartData = {
      weekly: analytics.dailyData.map((d) => ({
        day: d.date.split("-")[2],
        count: d.count,
      })),
      monthly: analytics.weeklyData.map((d) => ({
        day: d.label,
        count: d.count,
      })),
      all: analytics.monthlyData.map((d) => ({ day: d.label, count: d.count })),
    };

    // Calculate totals
    const totals = {
      weekly: analytics.dailyData.reduce((sum, item) => sum + item.count, 0),
      monthly: analytics.weeklyData.reduce((sum, item) => sum + item.count, 0),
      all: analytics.totalReferrals,
    };

    return { chartData, totals };
  };

  // Default totals
  const defaultTotals = {
    weekly: 49,
    monthly: 140,
    all: 1057,
  };

  // Use processed data
  const { chartData, totals } = analytics
    ? processAnalyticsData()
    : { chartData: sampleData, totals: defaultTotals };

  // Get current chart data based on selected period
  const getCurrentChartData = () => {
    if (selectedPeriod === "weekly") return chartData.weekly || [];
    if (selectedPeriod === "monthly") return chartData.monthly || [];
    return chartData.all || [];
  };

  // Get label for x-axis based on time period
  const getXAxisDataKey = () => {
    return "day";
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/leaderboard"
          className="text-gray-300 hover:text-blue-400 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="font-medium">Back to Leaderboard</span>
        </Link>
        <div className="relative">
          <h1 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-gray-300 relative z-10">
            Referral Analytics
          </h1>
          <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-blue-500/80 via-purple-500/60 to-blue-400/40"></div>
        </div>
      </div>

      {/* Summary Cards - hidden on mobile, visible on md screens and up */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card
          className={`${
            selectedPeriod === "weekly"
              ? "border-blue-500 border-2 bg-gray-800 shadow-md shadow-blue-900/20"
              : "border border-gray-700 bg-gray-800 hover:border-blue-500"
          } cursor-pointer transition-all duration-200 group`}
          onClick={() => setSelectedPeriod("weekly")}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-blue-400 transition-colors">
              This Week
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
              {totals.weekly}
            </div>
            <p className="text-xs text-gray-400 mt-1">Referrals this week</p>
          </CardContent>
        </Card>

        <Card
          className={`${
            selectedPeriod === "monthly"
              ? "border-blue-500 border-2 bg-gray-800 shadow-md shadow-blue-900/20"
              : "border border-gray-700 bg-gray-800 hover:border-blue-500"
          } cursor-pointer transition-all duration-200 group`}
          onClick={() => setSelectedPeriod("monthly")}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-blue-400 transition-colors">
              This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
              {totals.monthly}
            </div>
            <p className="text-xs text-gray-400 mt-1">Referrals this month</p>
          </CardContent>
        </Card>

        <Card
          className={`${
            selectedPeriod === "all"
              ? "border-blue-500 border-2 bg-gray-800 shadow-md shadow-blue-900/20"
              : "border border-gray-700 bg-gray-800 hover:border-blue-500"
          } cursor-pointer transition-all duration-200 group`}
          onClick={() => setSelectedPeriod("all")}
        >
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-gray-300 group-hover:text-blue-400 transition-colors">
              All Time
            </CardTitle>
            <History className="h-4 w-4 text-blue-400 opacity-70 group-hover:opacity-100 transition-opacity" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-100 group-hover:text-blue-400 transition-colors">
              {totals.all}
            </div>
            <p className="text-xs text-gray-400 mt-1">Total referrals</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="border border-gray-700 bg-gray-800 shadow-md">
        <CardHeader className="border-b border-gray-700 bg-gray-800 rounded-t-lg">
          <CardTitle className="text-xl text-gray-100">
            {selectedPeriod === "weekly"
              ? "Weekly Referral Activity"
              : selectedPeriod === "monthly"
              ? "Monthly Referral Activity"
              : "All Time Referral Activity"}
          </CardTitle>
          <CardDescription className="text-sm text-gray-400">
            {selectedPeriod === "weekly" &&
              "Daily referrals for the current week"}
            {selectedPeriod === "monthly" &&
              "Weekly referrals for the current month"}
            {selectedPeriod === "all" && "Monthly referrals for all time"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getCurrentChartData()}
                margin={{
                  top: selectedPeriod === "weekly" ? 25 : 10,
                  right: 30,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
                <XAxis
                  dataKey={getXAxisDataKey()}
                  tick={{ fill: "#cccccc", fontSize: 12 }}
                  stroke="#666666"
                />
                <YAxis
                  tick={{ fill: "#cccccc", fontSize: 12 }}
                  stroke="#666666"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#333333",
                    border: "1px solid #555555",
                    borderRadius: "6px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
                    color: "#e0e0e0",
                  }}
                  cursor={false}
                />
                <Bar
                  dataKey="count"
                  fill="url(#colorGradient)"
                  radius={[4, 4, 0, 0]}
                  barSize={selectedPeriod === "all" ? 30 : 40}
                  onMouseOver={(data) => {
                    // Custom hover effect logic if needed
                  }}
                >
                  <LabelList
                    dataKey="count"
                    position="top"
                    fill="#e0e0e0"
                    fontSize={12}
                    fontWeight="medium"
                    formatter={(value: any) => (value === 0 ? "" : value)}
                    style={{
                      textShadow: "0px 0px 3px rgba(0,0,0,0.75)",
                    }}
                  />
                </Bar>
                <defs>
                  <linearGradient
                    id="colorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient
                    id="colorGradientHover"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter className="border-t border-gray-700 bg-gray-800 rounded-b-lg py-4">
          <Tabs defaultValue={selectedPeriod} className="">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 bg-gray-700">
              <TabsTrigger
                value="weekly"
                className={`${
                  selectedPeriod === "weekly"
                    ? "bg-gray-900 text-blue-400 shadow-sm"
                    : "text-gray-300 hover:text-blue-400"
                } 
                  transition-all py-2 cursor-pointer`}
                onClick={() => setSelectedPeriod("weekly")}
              >
                Weekly
              </TabsTrigger>
              <TabsTrigger
                value="monthly"
                className={`${
                  selectedPeriod === "monthly"
                    ? "bg-gray-900 text-blue-400 shadow-sm"
                    : "text-gray-300 hover:text-blue-400"
                } 
                  transition-all py-2 cursor-pointer`}
                onClick={() => setSelectedPeriod("monthly")}
              >
                Monthly
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className={`${
                  selectedPeriod === "all"
                    ? "bg-gray-900 text-blue-400 shadow-sm"
                    : "text-gray-300 hover:text-blue-400"
                } 
                  transition-all py-2 cursor-pointer`}
                onClick={() => setSelectedPeriod("all")}
              >
                All Time
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardFooter>
      </Card>

      {/* Loading state */}
      {!analytics && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-80 z-10">
          <div className="bg-gray-800 shadow-xl border border-gray-700 rounded-lg p-6 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <div className="text-lg font-semibold text-gray-200">
              Loading analytics data...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main page component
export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-200">Loading...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
