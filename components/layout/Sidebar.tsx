"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Radio,
  AlertTriangle,
  GitBranch,
  History,
  Users2,
  BarChart3,
  Settings,
  ShieldAlert,
  RotateCcw,
  Activity,
  Layers,
  ArrowLeftRight,
  LogOut,
  Users,
} from "lucide-react";
import { useFleet } from "@/lib/context/FleetContext";
import { useAuth } from "@/lib/context/AuthContext";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badgeKey?: string;
}

const OPERATOR_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/map", label: "Live Fleet Map", icon: Map },
  { href: "/fleet", label: "Fleet Vehicles", icon: Radio },
  { href: "/incidents", label: "Incident Command", icon: AlertTriangle, badgeKey: "activeIncidentsCount" },
  { href: "/routes", label: "Route Intelligence", icon: GitBranch },
  { href: "/trips", label: "Trip History", icon: History },
  { href: "/drivers", label: "Drivers & Vehicles", icon: Users2 },
  { href: "/analytics", label: "Safety Analytics", icon: BarChart3 },
  { href: "/settings", label: "Organisation Settings", icon: Settings },
];

const USER_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "My Journey (Live)", icon: LayoutDashboard },
  { href: "/map", label: "Live Bus Map", icon: Map },
  { href: "/routes", label: "Kanpur Timetables", icon: GitBranch },
  { href: "/trips", label: "My Travel Passes", icon: History },
  { href: "/settings", label: "Preferences & Profile", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeIncidentsCount, criticalIncidentsCount, resetDemoData, isSimulating, toggleSimulation } = useFleet();
  const { currentUser, userRole, switchRole, logout, rebootSystem } = useAuth();

  const navItems = userRole === "USER" ? USER_NAV_ITEMS : OPERATOR_NAV_ITEMS;

  return (
    <aside className="w-64 bg-bg-surface border-r border-border hidden md:flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-border/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-nexus-cyan/20 to-nexus-blue/20 border border-nexus-cyan/40 flex items-center justify-center text-nexus-cyan shadow-glow">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold tracking-wider text-base text-tx-primary flex items-center gap-1.5 font-mono">
              NEXUS<span className="text-nexus-cyan">TRANSIT</span>
            </div>
            <div className="text-[10px] text-tx-secondary tracking-widest font-mono uppercase">
              {userRole === "USER" ? "COMMUTER CITIZEN PORTAL" : "FLEET SAFETY OS"}
            </div>
          </div>
        </div>

        {/* Live Simulation Indicator */}
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-bg-elevated border border-border flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSimulating ? "bg-nexus-safe shadow-glow-safe animate-pulse" : "bg-tx-muted"}`} />
            <span className="text-tx-secondary text-[11px] font-mono">
              {isSimulating ? "TELEMETRY LIVE" : "TELEMETRY PAUSED"}
            </span>
          </div>
          <button
            onClick={toggleSimulation}
            className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-bg-hover hover:bg-border-bright text-nexus-cyan border border-border transition-colors"
            title="Toggle simulated GPS ticks"
          >
            {isSimulating ? "Pause" : "Play"}
          </button>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href === "/map" && (pathname === "/maps" || pathname.startsWith("/map/")));
            const badgeValue = item.badgeKey === "activeIncidentsCount" ? activeIncidentsCount : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-nexus-cyan/15 text-nexus-cyan border border-nexus-cyan/30 shadow-glow"
                    : "text-tx-secondary hover:text-tx-primary hover:bg-bg-elevated"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-nexus-cyan" : "text-tx-muted"}`} />
                  <span>{item.label}</span>
                </div>

                {badgeValue > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold ${
                      criticalIncidentsCount > 0
                        ? "bg-nexus-critical/30 text-nexus-critical border border-nexus-critical/60 animate-pulse"
                        : "bg-nexus-warning/30 text-nexus-warning border border-nexus-warning/60"
                    }`}
                  >
                    {badgeValue}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Active User Profile & Role Switcher */}
      <div className="p-3 border-t border-border/70 space-y-2">
        <div
          className={`p-3 rounded-lg border text-xs transition-colors ${
            userRole === "OPERATOR"
              ? "bg-bg-elevated/70 border-nexus-cyan/40"
              : "bg-bg-elevated/70 border-nexus-safe/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border shrink-0 ${
                  userRole === "OPERATOR"
                    ? "bg-nexus-cyan/20 border-nexus-cyan text-nexus-cyan"
                    : "bg-nexus-safe/20 border-nexus-safe text-nexus-safe"
                }`}
              >
                {currentUser?.avatarText || "OP"}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-tx-primary text-[12px] truncate">
                  {currentUser?.name || "Neha Sharma"}
                </div>
                <div className="text-[10px] text-tx-secondary font-mono truncate">
                  {userRole === "OPERATOR" ? "Control Room Dispatcher" : "Citizen / Commuter"}
                </div>
              </div>
            </div>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                userRole === "OPERATOR"
                  ? "bg-nexus-cyan shadow-glow"
                  : "bg-nexus-safe shadow-glow-safe"
              }`}
              title="Active Profile"
            />
          </div>

          <div className="mt-2.5 pt-2 border-t border-border/50 text-[10px] text-tx-muted flex items-center justify-between font-mono">
            <span className="truncate">{currentUser?.badgeOrId}</span>
            <span className={userRole === "OPERATOR" ? "text-nexus-cyan" : "text-nexus-safe"}>
              {userRole}
            </span>
          </div>
        </div>

        {/* 1-Click Role Switcher Button */}
        <button
          onClick={() => switchRole(userRole === "OPERATOR" ? "USER" : "OPERATOR")}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-mono font-bold border transition-all ${
            userRole === "OPERATOR"
              ? "bg-nexus-safe/10 hover:bg-nexus-safe/20 text-nexus-safe border-nexus-safe/40"
              : "bg-nexus-cyan/10 hover:bg-nexus-cyan/20 text-nexus-cyan border-nexus-cyan/40"
          }`}
          title="Switch between Operator and User mode"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Switch to {userRole === "OPERATOR" ? "User Portal" : "Operator Mode"}</span>
        </button>

        {/* Logout / Switch Account Link */}
        <button
          onClick={() => {
            rebootSystem();
            router.push("/login");
          }}
          className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg bg-bg-elevated hover:bg-bg-hover text-tx-muted hover:text-tx-primary text-[11px] border border-border transition-colors font-mono"
          title="Sign out and return to bootup/login screen"
        >
          <RotateCcw className="w-3.5 h-3.5 text-nexus-cyan" />
          <span>Reboot System &amp; Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
