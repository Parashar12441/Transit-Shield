"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import BootupLoginPage from "@/app/login/page";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { NotificationDrawer } from "@/components/layout/NotificationDrawer";
import { EmergencyModal } from "@/components/layout/EmergencyModal";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, hasBooted, isInitialized } = useAuth();

  // Prevent flash while verifying stored session
  if (!isInitialized) {
    return (
      <div className="min-h-screen w-full bg-bg flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-nexus-cyan border-t-transparent animate-spin" />
      </div>
    );
  }

  // Show centered Bootup & Login if not authenticated or explicitly visiting /login
  if (!isAuthenticated || !hasBooted || pathname === "/login") {
    return <BootupLoginPage />;
  }

  return (
    <>
      {/* Main Navigation Sidebar */}
      <Sidebar />

      {/* Core Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />
        <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-24 md:pb-6">{children}</main>
      </div>

      {/* Mobile Sticky Bottom Navigation (Phone Viewport) */}
      <MobileBottomNav />

      {/* Global Modals & Drawers */}
      <NotificationDrawer />
      <EmergencyModal />
    </>
  );
}
