"use client";

import { Users, Share2, Copy } from "lucide-react";
import { useReferralStats, useUserProfile } from "@/hooks/useRewards";
import { toast } from "sonner";
import { Facebook, Linkedin, Whatsapp, X } from "@/assets/icons";

interface ReferralSectionProps {
  userId: string;
}

export function ReferralSection({ userId }: ReferralSectionProps) {
  const { data: stats, isLoading: statsLoading } = useReferralStats(userId);
  const { data: profile, isLoading: profileLoading } = useUserProfile(userId);

  const referralUrl = profile?.referral_code
    ? `${window.location.origin}/signup?ref=${profile.referral_code}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied to clipboard!");
  };

  const handleShare = (platform: string) => {
    const text = "Join me on Flowva and earn rewards!";
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        referralUrl
      )}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(referralUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        referralUrl
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(
        text + " " + referralUrl
      )}`,
    };
    window.open(
      urls[platform as keyof typeof urls],
      "_blank",
      "width=600,height=400"
    );
  };

  if (statsLoading || profileLoading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div className="transition-all duration-300 hover:-translate-y-2 hover:shadow-md p-4 rounded-3xl">
      <div className="flex items-start gap-2 mb-6 bg-[#EEF2FF] p-4 rounded-xl">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
          <Users className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold lg:text-xl md:text-lg">Share Your Link</h3>
          <p className="text-sm text-gray-600">
            Invite friends and earn 25 points when they join!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600 mb-1">
            {stats?.completedReferrals || 0}
          </div>
          <div className="text-sm text-gray-600">Referrals</div>
        </div>
        <div className="text-center">
          <div className="text-4xl font-bold text-purple-600 mb-1">
            {stats?.pointsEarned || 0}
          </div>
          <div className="text-sm text-gray-600">Points Earned</div>
        </div>
      </div>

      <div className="mb-4 bg-purple-50 p-4 rounded-xl">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your personal referral link:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 outline-purple-600  "
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-purple-600 rounded-lg cursor-pointer"
          >
            <Copy />
          </button>
        </div>
      </div>

      <div className="flex gap-5 justify-center">
        <a
          href="https://web.facebook.com/p/Flowvahub-61569773436543"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 bg-[#1877F2] flex items-center justify-center rounded-full"
        >
          <Facebook color="white" />
        </a>
        <a
          href="https://x.com/FlowvaHub"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 bg-black flex items-center justify-center rounded-full"
        >
          <X color="white" />
        </a>
        <a
          href="https://ca.linkedin.com/company/flowva"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 bg-[#0077B5] flex items-center justify-center rounded-full"
        >
          <Linkedin color="white" />
        </a>
        <a
          href="https://wa.me/15872872064"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 bg-[#25D366] flex items-center justify-center rounded-full"
        >
          <Whatsapp color="white" />
        </a>
      </div>
    </div>
  );
}
