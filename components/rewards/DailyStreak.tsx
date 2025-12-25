"use client";

import { Zap } from "lucide-react";
import {
  useUserStreak,
  useCanClaimToday,
  useClaimDailyPoints,
  useWeeklyCheckins,
} from "@/hooks/useRewards";
import { toast } from "sonner";
import { useState } from "react";
import { ClaimSuccessModal } from "./ClaimSuccessModal";
import { Calendar1 } from "@/assets/icons";

interface DailyStreakProps {
  userId: string;
}

export function DailyStreak({ userId }: DailyStreakProps) {
  const { data: streak, isLoading: streakLoading } = useUserStreak(userId);
  const { data: canClaim, isLoading: canClaimLoading } =
    useCanClaimToday(userId);
  const { data: weeklyCheckins } = useWeeklyCheckins(userId);
  const claimMutation = useClaimDailyPoints();

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastClaimData, setLastClaimData] = useState({ points: 0, streak: 0 });

  const handleClaim = async () => {
    try {
      const result = await claimMutation.mutateAsync(userId);
      setLastClaimData({
        points: result.points_awarded || 5,
        streak: result.new_streak || (streak?.current_streak || 0) + 1,
      });
      setShowSuccessModal(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to claim points"
      );
    }
  };

  if (streakLoading || canClaimLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
        <div className="h-48 bg-gray-200 rounded" />
      </div>
    );
  }

  //   console.log("canClaim", canClaim)
  //    const todays = new Date().toISOString().split("T")[0];
  //   console.log("todays", todays)

  // Generate last 7 days for the calendar view
  const today = new Date();
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i)); // 6 days ago to today
    return {
      date: d,
      dayName: d.toLocaleDateString("en-US", { weekday: "narrow" }), // M, T, W...
      dateString: d.toISOString().split("T")[0],
      isToday: i === 6,
    };
  });

  const currentStreak = streak?.current_streak || 0;

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-md">
        <div className="flex items-center gap-2 bg-[#EEF2FF] p-4 rounded-t-3xl">
          <Calendar1 className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold">Daily Streak</h3>
        </div>
        <div className="p-4">
          <div className="text-4xl font-bold mb-6 text-purple-600">
            {currentStreak} day{currentStreak !== 1 ? "s" : ""}
          </div>

          <div className="flex justify-between gap-1 mb-6">
            {weekDays.map((day, i) => {
              const isCheckedIn = weeklyCheckins?.includes(day.dateString);
              const isToday = day.isToday;

              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative ${
                      isCheckedIn
                        ? "ring-2 ring-purple-600 text-[#6b7280] bg-[#D1D5DB] ring-offset-2"
                        : isToday && canClaim
                        ? //   ? "border-100 text-white ring-2 ring-purple-600 ring-offset-2 animate-pulse"
                          "animate-pulse bg-[#E5E7EB] text-[#6b7280] ring-1 ring-purple-600"
                        : "bg-[#E5E7EB] text-[#6b7280]"
                    }`}
                  >
                    {day.dayName}
                    {isToday && (
                      <div className="absolute -bottom-2 w-1 h-1 bg-purple-600 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-sm text-hash mb-4 text-center font-semibold">
            Check in daily to earn +5 points
          </p>
          <button
            onClick={handleClaim}
            disabled={!canClaim || claimMutation.isPending}
            className={`w-full py-3 rounded-[24px] font-medium transition-all ${
              canClaim && !claimMutation.isPending
                ? "bg-purple-600 text-white hover:bg-purple-700 hover:-translate-y-2 hover:shadow-lg shadow-purple-200 cursor-pointer"
                : "bg-muted text-hash font-semibold cursor-not-allowed"
            }`}
          >
            {claimMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Claiming...
              </span>
            ) : canClaim ? (
              "✨ Claim Today's Points"
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap /> Claimed Today
              </span>
            )}
          </button>
        </div>
      </div>

      <ClaimSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        pointsAwarded={lastClaimData.points}
        streakDays={lastClaimData.streak}
      />
    </>
  );
}
