"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Search,
  Radio,
  Siren,
  Clock,
  ShieldCheck,
  MapPin,
  Wifi,
  Command,
  ArrowLeftRight,
  Shield,
  Users,
  Bus,
} from "lucide-react";
import { useFleet } from "@/lib/context/FleetContext";
import { useAuth } from "@/lib/context/AuthContext";
import { CommandPalette } from "@/components/layout/CommandPalette";

export function Header() {
  const pathname = usePathname();
  const {
    unreadNotificationsCount,
    setNotificationDrawerOpen,
    setEmergencyModalOpen,
    criticalIncidentsCount,
  } = useFleet();
  const { userRole, switchRole, currentUser } = useAuth();

  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Global Ctrl+K hotkey
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getPageTitle = (path: string) => {
    if (userRole === "USER") {
      switch (path) {
        case "/":
          return "My Journey & Live Bus Track";
        case "/map":
        case "/maps":
          return "Live Bus Geospatial Tracker";
        case "/routes":
          return "Kanpur e-Bus Timetables & Stops";
        case "/trips":
          return "My Travel Passes & Trip History";
        case "/settings":
          return "Commuter Profile & Preferences";
        default:
          return "Kanpur Commuter Portal";
      }
    }

    switch (path) {
      case "/":
        return "Overview Command Center";
      case "/map":
      case "/maps":
        return "Live Fleet Geospatial Map & Telemetry";
      case "/fleet":
        return "Fleet Vehicles & Live Status";
      case "/incidents":
        return "Incident Command & Emergency Operations";
      case "/routes":
        return "Route Intelligence & Safety Geofences";
      case "/trips":
        return "Trip History & Path Replay";
      case "/drivers":
        return "Driver & Vehicle Inventory";
      case "/analytics":
        return "Safety Analytics & Incident Metrics";
      case "/settings":
        return "Organisation & Safety Policy Settings";
      default:
        return "Fleet Safety System";
    }
  };

  return (
    <>
      <header className="h-14 sm:h-16 bg-bg-surface/90 backdrop-blur-md border-b border-border px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        {/* Title & Region */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexus-cyan/20 to-nexus-blue/20 border border-nexus-cyan/40 flex md:hidden items-center justify-center text-nexus-cyan shadow-glow shrink-0">
            <Bus className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold text-tx-primary tracking-wide truncate max-w-[150px] sm:max-w-none">
              {getPageTitle(pathname)}
            </h1>
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-tx-secondary font-mono truncate">
              <MapPin className="w-3 h-3 text-nexus-cyan shrink-0 hidden sm:inline" />
              <span className="truncate">Kanpur Urban (UP-78)</span>
              <span className="text-border-bright hidden sm:inline">•</span>
              <span className="text-nexus-safe hidden sm:flex items-center gap-1 font-semibold shrink-0">
                <Wifi className="w-3 h-3" /> LINK ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Center: Interactive Search Trigger & Demo indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            onClick={() => setCommandPaletteOpen(true)}
            className="relative w-64 hidden lg:flex items-center justify-between px-3 py-1.5 rounded-lg bg-bg-elevated hover:bg-bg-hover border border-border hover:border-nexus-cyan/50 text-xs text-tx-muted cursor-pointer transition-all shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-tx-muted" />
              <span>Quick search anything...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-bg-surface border border-border text-[9px] font-mono text-tx-secondary">
              Ctrl K
            </kbd>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-nexus-warning/10 border border-nexus-warning/30 text-nexus-warning text-[10px] font-mono tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-nexus-warning animate-pulse" />
            DEMO ENVIRONMENT &bull; SIMULATED TELEMETRY
          </div>

          {/* Quick Role Switcher Pill in Header (Desktop) */}
          <button
            onClick={() => switchRole(userRole === "OPERATOR" ? "USER" : "OPERATOR")}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
              userRole === "OPERATOR"
                ? "bg-nexus-cyan/15 hover:bg-nexus-cyan/25 text-nexus-cyan border-nexus-cyan/40 shadow-glow"
                : "bg-nexus-safe/15 hover:bg-nexus-safe/25 text-nexus-safe border-nexus-safe/40 shadow-glow-safe"
            }`}
            title="Click to toggle between Operator and Commuter/User section"
          >
            {userRole === "OPERATOR" ? (
              <Shield className="w-3.5 h-3.5" />
            ) : (
              <Users className="w-3.5 h-3.5" />
            )}
            <span>{userRole === "OPERATOR" ? "OPERATOR MODE" : "USER / CITIZEN"}</span>
            <ArrowLeftRight className="w-3 h-3 ml-0.5 opacity-60" />
          </button>
        </div>

        {/* Right Tools: Role Switcher (Mobile), Clock, Emergency Console Button, Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile Role Switcher Pill */}
          <button
            onClick={() => switchRole(userRole === "OPERATOR" ? "USER" : "OPERATOR")}
            className={`flex md:hidden items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-mono font-bold transition-all ${
              userRole === "OPERATOR"
                ? "bg-nexus-cyan/15 text-nexus-cyan border-nexus-cyan/40"
                : "bg-nexus-safe/15 text-nexus-safe border-nexus-safe/40"
            }`}
            title="Switch Mode"
          >
            <span>{userRole === "OPERATOR" ? "OP" : "USER"}</span>
            <ArrowLeftRight className="w-2.5 h-2.5 opacity-70" />
          </button>

          {/* Live Clock */}
          <div className="hidden sm:flex flex-col items-end pr-2 font-mono">
            <div className="text-xs text-tx-primary font-bold tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-nexus-cyan" />
              {timeStr}
            </div>
            <div className="text-[10px] text-tx-secondary">{dateStr} IST</div>
          </div>

          {/* Emergency Trigger Button */}
          <button
            onClick={() => setEmergencyModalOpen(true)}
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all font-mono ${
              criticalIncidentsCount > 0
                ? "bg-nexus-critical text-white border-nexus-critical shadow-glow-critical animate-pulse font-bold"
                : "bg-nexus-critical/15 hover:bg-nexus-critical/25 text-nexus-critical border-nexus-critical/40 hover:border-nexus-critical"
            }`}
            title="Open Emergency Dispatch Console / Trigger Simulated Driver SOS"
          >
            <Siren className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Emergency Console</span>
            {criticalIncidentsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-black/40 text-[10px] font-mono font-bold">
                {criticalIncidentsCount}
              </span>
            )}
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setNotificationDrawerOpen(true)}
            className="relative p-1.5 sm:p-2 rounded-lg bg-bg-elevated hover:bg-bg-hover text-tx-secondary hover:text-tx-primary border border-border transition-colors"
            title="View Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-nexus-critical text-white text-[9px] font-mono font-bold flex items-center justify-center shadow-glow-critical">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
}
