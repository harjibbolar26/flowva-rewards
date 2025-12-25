"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import {
  Sparkles,
  Search,
  BookOpen,
  Layers,
  CreditCard,
  Gift,
  LogOut,
  ChevronUp,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Card,
  Discover,
  Gem,
  Home,
  Library,
  Settings,
  Stack,
} from "@/assets/icons";
import Image from "next/image";

export function Sidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out");
    } finally {
      setSigningOut(false);
      setShowUserMenu(false);
    }
  };

  const navItems = [
    { icon: Home, label: "Home", href: "#", disabled: true },
    { icon: Discover, label: "Discover", href: "#", disabled: true },
    { icon: Library, label: "Library", href: "#", disabled: true },
    { icon: Stack, label: "Tech Stack", href: "#", disabled: true },
    { icon: Card, label: "Subscriptions", href: "#", disabled: true },
    { icon: Gem, label: "Rewards Hub", href: "/", disabled: false },
    { icon: Settings, label: "Settings", href: "#", disabled: true },
  ];

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.email?.split("@")[0] || "User";
  };

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 font-sans ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="p-6">
          <Image src={"/flowva.png"} alt="logo" width={146} height={60} />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.label}
                href={item.disabled ? "#" : item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-purple-100 text-purple-600 shadow-sm"
                    : item.disabled
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                  else if (window.innerWidth < 1024 && onClose) onClose();
                }}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        {user && (
          <div className="relative border-t border-gray-200">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getUserDisplayName().charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 text-sm">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <ChevronUp
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  showUserMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* User Menu Popup */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">
                      {signingOut ? "Signing out..." : "Sign out"}
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </aside>
    </>
  );
}
