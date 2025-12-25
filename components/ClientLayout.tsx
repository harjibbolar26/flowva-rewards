"use client";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          !isAuthPage ? "lg:ml-60" : ""
        }`}
      >
        {!isAuthPage && <TopNav onMenuClick={() => setIsSidebarOpen(true)} />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
