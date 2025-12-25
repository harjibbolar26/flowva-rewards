"use client";

import { X, Trophy, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface ClaimSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  pointsAwarded: number;
  streakDays: number;
}

export function ClaimSuccessModal({
  isOpen,
  onClose,
  pointsAwarded,
  streakDays,
}: ClaimSuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`bg-white rounded-2xl p-8 max-w-sm w-full relative transform transition-all duration-300 ${
          isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <Trophy className="w-10 h-10 text-yellow-600" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Points Claimed!
          </h2>
          <p className="text-gray-600 mb-6">
            You've successfully checked in for {today}.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="text-sm text-purple-600 font-medium mb-1">
                Points
              </div>
              <div className="text-2xl font-bold text-purple-700">
                +{pointsAwarded}
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="text-sm text-blue-600 font-medium mb-1">
                Streak
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {streakDays} Days
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 py-3 rounded-lg">
            <Calendar className="w-4 h-4" />
            <span>Come back tomorrow for more!</span>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}
