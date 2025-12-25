"use client";

import { useUserPoints } from "@/hooks/useRewards";
import { Award, Star } from "@/assets/icons";

interface PointsBalanceProps {
  userId: string;
}

export function PointsBalance({ userId }: PointsBalanceProps) {
  const { data: points, isLoading } = useUserPoints(userId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
        <div className="h-24 bg-gray-200 rounded" />
      </div>
    );
  }

  const progress = ((points?.points_balance || 0) / 5000) * 100;

  return (
    <div className="bg-white rounded-3xl shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-md">
      <div className="flex items-center gap-2 bg-[#EEF2FF] p-4 rounded-t-3xl">
        <Award className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold lg:text-xl">Points Balance</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-4xl font-bold">
            {points?.points_balance || 0}
          </span>
          <Star size={100} />
        </div>
        <div className="text-sm text-gray-600">
          Progress to $5 Gift Card
          <div className="flex items-center justify-between mt-1">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <span className="ml-2 text-xs">
              {points?.points_balance || 0}/5000
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
          <span>🚀</span> Just getting started — keep earning points!
        </p>
      </div>
    </div>
  );
}
