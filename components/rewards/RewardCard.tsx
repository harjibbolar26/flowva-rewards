"use client";

import { Star, Gift } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";

type Reward = Database["public"]["Tables"]["rewards"]["Row"];

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  userId: string;
  onRedeem: (reward: Reward) => void;
}

export function RewardCard({
  reward,
  userPoints,
  userId,
  onRedeem,
}: RewardCardProps) {
  const canRedeem =
    userPoints >= reward.points_required && !reward.is_coming_soon;
  const isLocked = userPoints < reward.points_required;

  return (
    <div className="bg-white rounded-xl lg:p-6 p-4 shadow-sm border border-purple-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-md flex flex-col items-center text-center h-full">
      <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Gift className="w-8 h-8 text-purple-600" />
      </div>

      <h3 className="font-bold text-gray-900 mb-2">{reward.name}</h3>

      <p className="text-sm text-gray-500 mb-4 line-clamp-2 grow">
        {reward.description}
      </p>

      <div className="flex items-center gap-1 mb-6">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="font-bold text-purple-600">
          {reward.points_required} pts
        </span>
      </div>

      <button
        onClick={() => canRedeem && onRedeem(reward)}
        disabled={!canRedeem || (reward.is_coming_soon ?? false)}
        className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
          reward.is_coming_soon
            ? "bg-[#D7E0ED] text-white cursor-not-allowed"
            : canRedeem
            ? "bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-200"
            : "bg-[#D7E0ED] text-white cursor-not-allowed"
        }`}
      >
        {reward.is_coming_soon ? "Coming Soon" : isLocked ? "Locked" : "Redeem"}
      </button>
    </div>
  );
}
