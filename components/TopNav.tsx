"use client";

import { Bell } from "@/assets/icons";
import { Menu } from "lucide-react";
import { useState } from "react";

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="fixed top-0 right-0 z-30 w-full lg:w-[calc(100%-240px)] bg-[#F9FAFB] backdrop-blur-md pt-10 lg:px-10 px-6 font-roboto">
      <div className="flex items-center justify-between mx-auto">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <h1 className="lg:text-2xl text-xl  text-gray-900">
                Rewards Hub
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Earn points, unlock rewards, and celebrate your progress!
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 sm:hidden block">
            Earn points, unlock rewards, and celebrate your progress!
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-gray-600 relative w-10 h-10 rounded-full bg-[#e2e8f0] hover:bg-[#e2e8f0]/80 cursor-pointer"
            aria-label="Notifications"
          >
            <Bell color="black" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="p-4 text-center text-gray-500 text-sm">
                  No new notifications
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
