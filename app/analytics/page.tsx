"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/leaderboard" className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Referral Analytics</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card
          className={`${
            selectedPeriod === "weekly" ? "border-blue-500 border-2" : ""
          } cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => setSelectedPeriod("weekly")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.weekly}</div>
          </CardContent>
        </Card>

        <Card
          className={`${
            selectedPeriod === "monthly" ? "border-blue-500 border-2" : ""
          } cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => setSelectedPeriod("monthly")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.monthly}</div>
          </CardContent>
        </Card>

        <Card
          className={`${
            selectedPeriod === "all" ? "border-blue-500 border-2" : ""
          } cursor-pointer hover:shadow-md transition-shadow`}
          onClick={() => setSelectedPeriod("all")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">All Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.all}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>
            Referrals -{" "}
            {selectedPeriod === "weekly"
              ? "This Week"
              : selectedPeriod === "monthly"
              ? "This Month"
              : "All Time"}
          </CardTitle>
          <CardDescription>
            {selectedPeriod === "weekly" &&
              "Daily referrals for the current week"}
            {selectedPeriod === "monthly" &&
              "Weekly referrals for the current month"}
            {selectedPeriod === "all" && "Monthly referrals for all time"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getCurrentChartData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={getXAxisDataKey()} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex gap-2">
            <Tabs defaultValue={selectedPeriod}>
              <TabsList>
                <TabsTrigger
                  value="weekly"
                  className={selectedPeriod === "weekly" ? "bg-blue-100" : ""}
                  onClick={() => setSelectedPeriod("weekly")}
                >
                  Weekly
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className={selectedPeriod === "monthly" ? "bg-blue-100" : ""}
                  onClick={() => setSelectedPeriod("monthly")}
                >
                  Monthly
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className={selectedPeriod === "all" ? "bg-blue-100" : ""}
                  onClick={() => setSelectedPeriod("all")}
                >
                  All Time
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardFooter>
      </Card>

      {/* Loading state */}
      {!analytics && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
          <div className="text-lg">Loading analytics data...</div>
        </div>
      )}
    </div>
  );
}

// Main page component that wraps the content in a Suspense boundary
export default function AnalyticsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading analytics...</div>}>
      <AnalyticsContent />
    </Suspense>
  );
}
