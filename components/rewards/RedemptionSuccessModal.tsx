"use client";

import { X, Gift, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface RedemptionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardName: string;
  pointsSpent: number;
}

export function RedemptionSuccessModal({
  isOpen,
  onClose,
  rewardName,
  pointsSpent,
}: RedemptionSuccessModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

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
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-green-600" />
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1">
              <CheckCircle className="w-6 h-6 text-green-500 fill-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Redemption Successful!
          </h2>
          <p className="text-gray-600 mb-6">
            You have successfully redeemed{" "}
            <span className="font-semibold text-gray-900">{rewardName}</span>.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Points Spent</span>
              <span className="font-bold text-red-500">-{pointsSpent}</span>
            </div>
            <div className="text-xs text-gray-500 text-left">
              Your request is being processed. You will receive an email shortly
              with further instructions.
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
