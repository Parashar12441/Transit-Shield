"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { useFleet } from "@/lib/context/FleetContext";
import {
  Bus,
  Map,
  Clock,
  CreditCard,
  LayoutDashboard,
  Radio,
  AlertTriangle,
  ArrowLeftRight,
  Shield,
  Users,
} from "lucide-react";

interface NavTab {
  href: string;
  label: string;
  icon: any;
  badge?: number;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { userRole, switchRole } = useAuth();
  const { activeIncidentsCount } = useFleet();

  const isUser = userRole === "USER";

  const userTabs: NavTab[] = [
    { href: "/", label: "My Ride", icon: Bus },
    { href: "/map", label: "Live Map", icon: Map },
    { href: "/routes", label: "Timetable", icon: Clock },
    { href: "/trips", label: "Passes", icon: CreditCard },
  ];

  const operatorTabs: NavTab[] = [
    { href: "/", label: "Overview", icon: LayoutDashboard },
    { href: "/map", label: "Fleet Map", icon: Map },
    { href: "/fleet", label: "Vehicles", icon: Radio },
    { href: "/incidents", label: "Alerts", icon: AlertTriangle, badge: activeIncidentsCount },
  ];

  const tabs = isUser ? userTabs : operatorTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-surface/95 backdrop-blur-xl border-t border-border px-2 py-1.5 md:hidden shadow-[0_-8px_25px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative min-w-[56px] min-h-[48px] select-none ${
                isActive
                  ? isUser
                    ? "text-nexus-safe font-bold bg-nexus-safe/10"
                    : "text-nexus-cyan font-bold bg-nexus-cyan/10"
                  : "text-tx-secondary hover:text-tx-primary"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-nexus-critical text-white text-[9px] font-mono font-bold flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    isUser ? "bg-nexus-safe shadow-glow-safe" : "bg-nexus-cyan shadow-glow"
                  }`}
                />
              )}
            </Link>
          );
        })}

        {/* 1-Tap Role Switcher Tab for Mobile */}
        <button
          onClick={() => switchRole(isUser ? "OPERATOR" : "USER")}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-tx-muted hover:text-tx-primary transition-all min-w-[56px] min-h-[48px] select-none"
          title={`Switch to ${isUser ? "Operator Console" : "User Portal"}`}
        >
          <div className="relative p-1 rounded-lg bg-bg-elevated border border-border">
            <ArrowLeftRight className="w-3.5 h-3.5 text-nexus-cyan" />
          </div>
          <span className="text-[9px] font-mono mt-0.5 text-nexus-cyan font-semibold">
            {isUser ? "Operator" : "User"}
          </span>
        </button>
      </div>
    </nav>
  );
}

export default MobileBottomNav;
