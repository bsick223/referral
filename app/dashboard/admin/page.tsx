"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { RefreshCw, Database, Check, AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";

// List of admin user IDs
const ADMIN_IDS = ["user_2VG5LoCd46W8Qfm2X5EJsjzSM0h"];

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const [isRunning, setIsRunning] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [result, setResult] = useState<{
    message: string;
    count: number;
  } | null>(null);
  const [recalcResult, setRecalcResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recalcError, setRecalcError] = useState<string | null>(null);

  // Run migration function
  const runMigration = useMutation(
    api.migrations.migrateApplicationStatusHistory
  );

  // Get all user IDs for achievement recalculation
  const allUserIds = useQuery(api.users.getAllUserIds);

  // Use achievement check mutation
  const checkAchievements = useMutation(
    api.achievements.checkAndUpdateAchievements
  );

  // Check if the current user is an admin
  const isAdmin = isLoaded && user && ADMIN_IDS.includes(user.id);

  // If not admin, redirect to dashboard
  if (isLoaded && !isAdmin) {
    redirect("/dashboard");
  }

  const handleRunMigration = async () => {
    setIsRunning(true);
    setResult(null);
    setError(null);

    try {
      const migrationResult = await runMigration({});
      setResult(migrationResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during migration"
      );
    } finally {
      setIsRunning(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#090d1b] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#090d1b] min-h-screen">
      <div className="max-w-4xl mx-auto p-6">
        <div className="relative mb-8">
          <h1 className="text-2xl font-light tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-100 to-gray-300 relative z-10">
            Admin Dashboard
          </h1>
          <div className="absolute -bottom-1 left-0 h-[1px] w-full bg-gradient-to-r from-orange-500/80 via-purple-500/60 to-blue-500/40"></div>
        </div>

        <div className="bg-[#121a36]/50 backdrop-blur-sm rounded-xl shadow-md overflow-hidden border border-[#20253d]/50 mb-6">
          <div className="p-6 border-b border-[#20253d]/50">
            <h2 className="text-xl font-light text-white flex items-center">
              <Database className="h-5 w-5 mr-2 text-blue-400" />
              Database Migrations
            </h2>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-2">
                Application Status History Migration
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                This migration will populate the applicationStatusHistory table
                with initial data from existing applications. This enables
                achievements to track progress even when applications change
                status.
              </p>

              <button
                onClick={handleRunMigration}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md 
                          disabled:bg-blue-800/50 disabled:cursor-not-allowed flex items-center"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Running Migration...
                  </>
                ) : (
                  "Run Migration"
                )}
              </button>

              {result && (
                <div className="mt-4 p-3 bg-green-900/20 border border-green-600/30 rounded-md flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-green-400">{result.message}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Processed {result.count} applications
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-600/30 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-red-400">Migration failed</p>
                    <p className="text-sm text-gray-400 mt-1">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Achievement Recalculation */}
            <div className="mt-8 pt-8 border-t border-[#20253d]/50">
              <h3 className="text-lg font-medium text-white mb-2">
                Recalculate All User Achievements
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                This will recalculate achievements for all users based on the
                new status history tracking. Run this after completing the
                migration above.
              </p>

              <button
                onClick={async () => {
                  if (!allUserIds || allUserIds.length === 0) {
                    setRecalcError("No users found to process");
                    return;
                  }

                  setIsRecalculating(true);
                  setRecalcResult(null);
                  setRecalcError(null);

                  try {
                    // Process each user
                    let processed = 0;
                    for (const userId of allUserIds) {
                      await checkAchievements({ userId });
                      processed++;
                    }

                    setRecalcResult(
                      `Successfully recalculated achievements for ${processed} users`
                    );
                  } catch (err) {
                    setRecalcError(
                      err instanceof Error
                        ? err.message
                        : "An error occurred during recalculation"
                    );
                  } finally {
                    setIsRecalculating(false);
                  }
                }}
                disabled={isRecalculating || !allUserIds}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md 
                          disabled:bg-purple-800/50 disabled:cursor-not-allowed flex items-center"
              >
                {isRecalculating ? (
                  <>
                    <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                    Recalculating...
                  </>
                ) : (
                  "Recalculate All Achievements"
                )}
              </button>

              {recalcResult && (
                <div className="mt-4 p-3 bg-green-900/20 border border-green-600/30 rounded-md flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-green-400">{recalcResult}</p>
                  </div>
                </div>
              )}

              {recalcError && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-600/30 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                  <div>
                    <p className="text-red-400">Recalculation failed</p>
                    <p className="text-sm text-gray-400 mt-1">{recalcError}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
