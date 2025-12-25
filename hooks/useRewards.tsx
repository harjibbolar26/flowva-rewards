import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useUserPoints(userId: string) {
  return useQuery({
    queryKey: ["userPoints", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_points")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useUserStreak(userId: string) {
  return useQuery({
    queryKey: ["userStreak", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data as {
        current_streak: number;
        longest_streak: number;
        last_checkin_date: string | null;
      } | null;
    },
    enabled: !!userId,
  });
}

export function useCanClaimToday(userId: string) {
  return useQuery({
    queryKey: ["canClaimToday", userId],
    queryFn: async () => {
      const supabase = createClient();
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("daily_checkins")
        .select("id")
        .eq("user_id", userId)
        .eq("checkin_date", today)
        .maybeSingle();

      if (error) throw error;
      // console.log(data);
      return !data;
    },
    enabled: !!userId,
  });
}

export function useClaimDailyPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("claim_daily_points", {
        p_user_id: userId,
      });

      if (error) throw error;

      const result = data as {
        success: boolean;
        error?: string;
        points_awarded?: number;
        new_streak?: number;
      };
      if (!result.success) {
        throw new Error(result.error || "Failed to claim points");
      }

      return result;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["userPoints", userId] });
      queryClient.invalidateQueries({ queryKey: ["userStreak", userId] });
      queryClient.invalidateQueries({ queryKey: ["canClaimToday", userId] });
      queryClient.invalidateQueries({ queryKey: ["weeklyCheckins", userId] });
    },
  });
}

export function useReferralStats(userId: string) {
  return useQuery({
    queryKey: ["referralStats", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", userId);

      if (error) throw error;

      const referrals = data || [];
      const completedReferrals = referrals.filter((r) => r.is_completed).length;
      const totalReferrals = referrals.length;
      const pointsEarned = referrals
        .filter((r) => r.is_completed)
        .reduce((sum, r) => sum + r.points_awarded, 0);

      return {
        totalReferrals,
        completedReferrals,
        pointsEarned,
      };
    },
    enabled: !!userId,
  });
}

export function useRewards() {
  return useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .order("points_required", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      rewardId,
      redemptionData,
    }: {
      userId: string;
      rewardId: string;
      redemptionData: any;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("redeem_reward", {
        p_user_id: userId,
        p_reward_id: rewardId,
        p_redemption_data: redemptionData,
      });

      if (error) throw error;

      const result = data as {
        success: boolean;
        error?: string;
        redemption_id?: string;
        points_spent?: number;
      };
      if (!result.success) {
        throw new Error(result.error || "Failed to redeem reward");
      }

      return result;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["userPoints", userId] });
    },
  });
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useWeeklyCheckins(userId: string) {
  return useQuery({
    queryKey: ["weeklyCheckins", userId],
    queryFn: async () => {
      const supabase = createClient();
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); // 7 days window including today

      const { data, error } = await supabase
        .from("daily_checkins")
        .select("checkin_date")
        .eq("user_id", userId)
        .gte("checkin_date", sevenDaysAgo.toISOString().split("T")[0])
        .lte("checkin_date", today.toISOString().split("T")[0]);

      if (error) throw error;
      return (data || []).map((d: { checkin_date: string }) => d.checkin_date);
    },
    enabled: !!userId,
  });
}

export function useSubmitStackShare() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stackContent,
      shareLink,
      platform,
    }: {
      stackContent: string;
      shareLink: string;
      platform: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("submit_stack_share", {
        p_stack_content: stackContent,
        p_share_link: shareLink,
        p_platform: platform,
      } as any);

      if (error) throw error;

      const result = data as {
        success: boolean;
        error?: string;
        points_awarded?: number;
      };

      if (!result.success) {
        throw new Error(result.error || "Failed to submit share");
      }

      return result;
    },
    onSuccess: (_, {}) => {
      // Invalidate user points to refresh balance
      queryClient.invalidateQueries({ queryKey: ["userPoints"] });
    },
  });
}
