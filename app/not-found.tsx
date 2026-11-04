"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  LayoutDashboard,
  Radio,
  AlertTriangle,
  GitBranch,
  History,
  Users2,
  BarChart3,
  Settings,
  ArrowLeft,
  Radar,
  Compass,
} from "lucide-react";

export default function NotFound() {
  const quickLinks = [
    { href: "/", label: "Overview Command", desc: "Main fleet dashboard & active alerts", icon: LayoutDashboard },
    { href: "/fleet", label: "Live Fleet Telemetry", desc: "Real-time bus tracking on Leaflet map", icon: Radio },
    { href: "/incidents", label: "Incident Command", desc: "Emergency triage & dispatch log", icon: AlertTriangle },
    { href: "/routes", label: "Route Intelligence", desc: "Geofences, corridors & stops", icon: GitBranch },
    { href: "/trips", label: "Trip History", desc: "Historical trip playback & telemetry replay", icon: History },
    { href: "/drivers", label: "Drivers & Vehicles", desc: "Shift rosters, licenses & status", icon: Users2 },
    { href: "/analytics", label: "Safety Analytics", desc: "Incident rates, speeds & SLA metrics", icon: BarChart3 },
    { href: "/settings", label: "Organisation Settings", desc: "Map tile layers & safety policies", icon: Settings },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-bg-surface border border-nexus-critical/40 rounded-2xl shadow-2xl p-8 relative overflow-hidden tech-card animate-fade-in">
        {/* Radar Background Glow */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-nexus-critical/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-nexus-cyan/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-nexus-critical/15 border border-nexus-critical/50 flex items-center justify-center text-nexus-critical shadow-glow-critical">
                <ShieldAlert className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-nexus-critical/20 text-nexus-critical border border-nexus-critical/40 font-bold">
                    SIGNAL LOST &bull; 404
                  </span>
                  <span className="text-[11px] font-mono text-tx-muted">
                    GEO-COORDINATES UNMAPPED
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-mono text-tx-primary tracking-wide mt-1">
                  Dispatch Route Not Found
                </h1>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-nexus-cyan hover:bg-nexus-cyan/90 text-black font-semibold text-xs transition-colors shadow-glow font-mono self-start sm:self-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Command Center</span>
            </Link>
          </div>

          {/* Description */}
          <div className="text-sm text-tx-secondary font-sans leading-relaxed">
            The telemetry path or dispatch page you requested does not exist in this sector.
            Select a verified operational sector below to resume fleet monitoring:
          </div>

          {/* Grid of Verified Routes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="p-3.5 rounded-xl bg-bg-elevated/70 hover:bg-bg-elevated border border-border hover:border-nexus-cyan/50 transition-all flex items-start gap-3 group"
                >
                  <div className="p-2 rounded-lg bg-bg-surface border border-border text-tx-muted group-hover:text-nexus-cyan group-hover:border-nexus-cyan/40 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-tx-primary group-hover:text-nexus-cyan transition-colors font-mono">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-tx-muted truncate mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Diagnostics footer */}
          <div className="pt-4 border-t border-border/70 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-tx-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-nexus-safe shadow-glow-safe animate-pulse" />
              <span>NEXUS TELEMETRY OS: KANPUR CORRIDOR ONLINE</span>
            </div>
            <div className="text-tx-secondary">
              PORT 3000 &bull; LAT: 26.465, LNG: 80.310
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
