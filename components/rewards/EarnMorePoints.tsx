"use client";

import {
  Star,
  Share2,
  Link as LinkIcon,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useSubmitStackShare } from "@/hooks/useRewards";
import { toast } from "sonner";
import { Facebook, X } from "@/assets/icons";

export function EarnMorePoints() {
  const [step, setStep] = useState<"input" | "share" | "verify">("input");
  const [stackContent, setStackContent] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [platform, setPlatform] = useState<"twitter" | "facebook">("twitter");

  const submitShareMutation = useSubmitStackShare();

  const handleShare = (selectedPlatform: "twitter" | "facebook") => {
    if (!stackContent.trim()) {
      toast.error("Please enter your stack first");
      return;
    }

    setPlatform(selectedPlatform);
    const text = encodeURIComponent(
      `My tech stack: ${stackContent}\n\nShared via Flowva Rewards! \n\nSign up at http://flowvahub.com`
    );
    const url =
      selectedPlatform === "twitter"
        ? `https://twitter.com/intent/tweet?text=${text}`
        : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            "https://flowvahub.com"
          )}&quote=${text}`;

    window.open(url, "_blank");
    setStep("verify");
  };

  const handleSubmit = async () => {
    if (!shareLink.trim()) {
      toast.error("Please paste the link to your post");
      return;
    }

    try {
      const result = await submitShareMutation.mutateAsync({
        stackContent,
        shareLink,
        platform,
      });

      toast.success(`Success! You earned ${result.points_awarded} points!`);
      setStep("input");
      setStackContent("");
      setShareLink("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit share"
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Refer and Win */}
      <div className="rounded-3xl shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-md hover:border-purple-500">
        <div className="flex items-center gap-4 bg-white p-4 rounded-t-3xl">
          <div className="w-10 h-10 bg-[#e490e61a] rounded-lg flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">
              Refer and win 10,000 points!
            </h3>
          </div>
        </div>
        <p className="text-sm text-hash  p-4">
          Invite 3 friends by Nov 20 and earn a chance to be one of 5 winners of{" "}
          <span className="text-purple-600 font-medium">10,000 points</span>.
          Friends must complete onboarding to qualify.
        </p>
      </div>

      {/* Share Your Stack */}
      <div className="rounded-3xl shadow-sm border border-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-md hover:border-purple-600">
        <div className="">
          <div className="flex items-start gap-5 p-4 bg-white rounded-t-3xl">
            <div className="w-10 h-10 bg-[#9013fe1a] rounded-lg flex items-center justify-center flex-shrink-0">
              <Share2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg">Share Your Stack</h3>
              <p className="text-sm text-gray-600">
                Earn +25 pts by sharing your tools!
              </p>
            </div>
          </div>
          <div className="p-4">
            {step === "input" && (
              <div className="flex items-center gap-3 ">
                <input
                  type="text"
                  value={stackContent}
                  onChange={(e) => setStackContent(e.target.value)}
                  placeholder="e.g. Next.js, Supabase, Tailwind..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare("twitter")}
                    className="flex-1 px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 w-fit cursor-pointer"
                  >
                    <X />
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="flex-1 px-3 py-2 bg-[#1877F2] text-white rounded-lg text-sm font-medium hover:bg-[#166fe5] transition-colors flex items-center justify-center gap-2 w-fit cursor-pointer"
                  >
                    <Facebook />
                  </button>
                </div>
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                  Step 2: Paste the link to your post below to claim points.
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={shareLink}
                      onChange={(e) => setShareLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={submitShareMutation.isPending}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitShareMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Claim
                  </button>
                </div>
                <button
                  onClick={() => setStep("input")}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Back to edit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
