"use client";

import { useState, useMemo } from "react";
import { useUser } from "@/hooks/useUser";
import { PointsBalance } from "@/components/rewards/PointsBalance";
import { DailyStreak } from "@/components/rewards/DailyStreak";
import { ReferralSection } from "@/components/rewards/ReferralSection";
import { RewardCard } from "@/components/rewards/RewardCard";
import { EarnMorePoints } from "@/components/rewards/EarnMorePoints";
import { useRewards, useUserPoints, useRedeemReward } from "@/hooks/useRewards";
import { Calendar, Sparkles } from "lucide-react";
import { RedemptionSuccessModal } from "@/components/rewards/RedemptionSuccessModal";
import { toast } from "sonner";
import type { Database } from "@/lib/supabase/database.types";
import Image from "next/image";
import { Calendar1, Gift, UserPlus } from "@/assets/icons";

type Reward = Database["public"]["Tables"]["rewards"]["Row"];

export default function RewardsPage() {
  const [activeTab, setActiveTab] = useState<"earn" | "redeem">("earn");
  const [filterTab, setFilterTab] = useState<
    "all" | "unlocked" | "locked" | "coming_soon"
  >("all");

  // Redemption State
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pointsSpent, setPointsSpent] = useState(0);

  const { user } = useUser();
  const { data: rewardsData, isLoading: rewardsLoading } = useRewards();
  const { data: points } = useUserPoints(user?.id || "");
  const redeemMutation = useRedeemReward();

  const rewards = rewardsData as Reward[] | undefined;
  const userPoints = points?.points_balance || 0;

  const filteredRewards = useMemo(() => {
    if (!rewards) return [];

    return rewards.filter((reward) => {
      if (filterTab === "all") return true;
      if (filterTab === "coming_soon") return reward.is_coming_soon;

      const isUnlocked =
        userPoints >= reward.points_required && !reward.is_coming_soon;

      if (filterTab === "unlocked") return isUnlocked;
      if (filterTab === "locked") return !isUnlocked && !reward.is_coming_soon;

      return true;
    });
  }, [rewards, filterTab, userPoints]);

  const counts = useMemo(() => {
    if (!rewards) return { all: 0, unlocked: 0, locked: 0, coming_soon: 0 };

    return {
      all: rewards.length,
      unlocked: rewards.filter(
        (r) => userPoints >= r.points_required && !r.is_coming_soon
      ).length,
      locked: rewards.filter(
        (r) => userPoints < r.points_required && !r.is_coming_soon
      ).length,
      coming_soon: rewards.filter((r) => r.is_coming_soon).length,
    };
  }, [rewards, userPoints]);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setShowConfirmModal(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !user) return;

    try {
      const redemptionData = {
        email: user.email,
        timestamp: new Date().toISOString(),
      };

      const result = await redeemMutation.mutateAsync({
        userId: user.id,
        rewardId: selectedReward.id,
        redemptionData,
      });

      setPointsSpent(result.points_spent || selectedReward.points_required);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      // Note: selectedReward is NOT cleared here so modal can use it
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to redeem reward"
      );
      setShowConfirmModal(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className="text-gray-600">
            You need to be logged in to view rewards
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-black overflow-x-hidden md:mt-20 mt-25 lg:p-10 pt-8 px-4">
      <div className="mx-auto">
        {/* Main Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("earn")}
            className={`py-3 px-4 font-medium transition-colors relative cursor-pointer ${
              activeTab === "earn"
                ? "text-purple-600 bg-[#9013fe0d] rounded-t-2xl"
                : "text-gray-500 hover:bg-[#9013fe0d] rounded-t-2xl"
            }`}
          >
            Earn Points
            {activeTab === "earn" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("redeem")}
            className={`py-3 px-4 font-medium transition-colors relative cursor-pointer ${
              activeTab === "redeem"
                ? "text-purple-600 bg-[#9013fe0d] rounded-t-2xl"
                : "text-gray-500 hover:bg-[#9013fe0d] rounded-t-2xl"
            }`}
          >
            Redeem Rewards
            {activeTab === "redeem" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
        </div>

        {activeTab === "earn" ? (
          <>
            <h2 className="text-2xl font-bold mb-6 border-l-4 border-purple-600 pl-4">
              Your Rewards Journey
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <PointsBalance userId={user.id} />
              <DailyStreak userId={user.id} />
              <div className="rounded-3xl shadow-sm flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-md">
                <div className="bg-[linear-gradient(135deg,#9013fe,#70d6ff)] rounded-t-3xl p-4 shadow-lg text-white">
                  <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-1">
                    Featured
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold mb-2">
                      Top Tool Spotlight
                    </h3>
                    <Image
                      src="/object.png"
                      alt="object"
                      width={64}
                      height={64}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full"
                    />
                  </div>
                  <p className="text-lg font-semibold mb-4">Reclaim</p>
                </div>
                <div className="bg-white pt-4 px-4 rounded-b-3xl flex-1">
                  <div className="flex items-start gap-3 mb-10">
                    <div className="">
                      <Calendar className="text-purple-500" />
                    </div>
                    <div className="text-sm">
                      <p className="opacity-90 font-semibold mb-1">
                        Automate and Optimize Your Schedule
                      </p>
                      <p className="text-hash">
                        Reclaim.ai is an AI-powered calendar assistant that
                        automatically schedules your tasks, meetings, and breaks
                        to boost productivity. Free to try — earn Flowva Points
                        when you sign up!
                      </p>
                    </div>
                  </div>
                  <hr className="border-t-muted" />
                  <div className="my-2 flex items-center justify-between">
                    <button className="bg-purple-600 py-2 px-3 text-sm font-semibold rounded-full flex items-center justify-center gap-2 outline-none border-none text-white">
                      <UserPlus size={18} />
                      Sign up
                    </button>
                    <button className="bg-[linear-gradient(45deg,#9013fe,#ff8687)] py-2 px-3 text-sm font-semibold rounded-full flex items-center justify-center gap-2 outline-none border-none text-white">
                      <Gift size={15} />
                      Claim 50 pts
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-6 border-l-4 border-purple-600 pl-4">
              Earn More Points
            </h2>
            <EarnMorePoints />

            <h2 className="text-2xl font-bold mb-6 mt-8 border-l-4 border-purple-600 pl-4">
              Refer & Earn
            </h2>
            <ReferralSection userId={user.id} />
          </>
        ) : (
          <div className="">
            <h2 className="text-2xl font-bold mb-6">Redeem Your Points</h2>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {[
                { id: "all", label: "All Rewards" },
                { id: "unlocked", label: "Unlocked" },
                { id: "locked", label: "Locked" },
                { id: "coming_soon", label: "Coming Soon" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`px-4 py-3 rounded-t-2xl text-sm md:text-base font-medium transition-all flex items-center gap-2 hover:bg-[#9013fe0d] cursor-pointer ${
                    filterTab === tab.id
                      ? "bg-[#9013fe0d] text-purple-600 border-b-2 border-purple-400"
                      : "text-gray-500"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`px-1.5 py-0.5 rounded-2xl text-xs ${
                      filterTab === tab.id
                        ? "bg-purple-200 text-purple-800"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {counts[tab.id as keyof typeof counts]}
                  </span>
                </button>
              ))}
            </div>

            {rewardsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse"
                  >
                    <div className="h-48 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredRewards?.map((reward) => (
                  <RewardCard
                    key={reward.id}
                    reward={reward}
                    userPoints={userPoints}
                    userId={user.id}
                    onRedeem={handleRedeemClick}
                  />
                ))}
                {filteredRewards?.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No rewards found in this category.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">
              Redeem {selectedReward.name}?
            </h2>
            <p className="text-gray-600 mb-6">
              You will spend {selectedReward.points_required} points to redeem
              this reward. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRedeem}
                disabled={redeemMutation.isPending}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {redeemMutation.isPending ? "Redeeming..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <RedemptionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSelectedReward(null);
        }}
        rewardName={selectedReward?.name || ""}
        pointsSpent={pointsSpent}
      />
    </div>
  );
}
