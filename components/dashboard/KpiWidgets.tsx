"use client";

import React from "react";
import { Bus, Radio, AlertTriangle, AlertOctagon, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useFleet } from "@/lib/context/FleetContext";

export function KpiWidgets() {
  const { buses, activeIncidentsCount, criticalIncidentsCount, selectBus, selectIncident, incidents } = useFleet();

  const totalRegisteredFleet = 240;
  const activeTripsCount = buses.length;
  const onlineCount = buses.filter((b) => b.trackingStatus === "LIVE").length;
  const staleBuses = buses.filter((b) => b.trackingStatus === "STALE");
  const criticalIncident = incidents.find((i) => i.severity === "CRITICAL" && !["RESOLVED", "CLOSED"].includes(i.status));

  const kpis = [
    {
      id: "TOTAL",
      label: "TOTAL REGISTERED FLEET",
      value: totalRegisteredFleet,
      subValue: "Metropolitan Division",
      trend: "Zone 1 & 2",
      icon: Bus,
      color: "text-nexus-cyan",
      borderColor: "border-nexus-cyan/30",
      bgAura: "hover:border-nexus-cyan/60 hover:bg-nexus-cyan/5",
      onClick: () => selectBus(null),
    },
    {
      id: "ACTIVE",
      label: "ACTIVE TRIPS ON ROUTE",
      value: activeTripsCount,
      subValue: "100% Scheduled Dispatch",
      trend: "+2 on-demand",
      icon: Radio,
      color: "text-nexus-blue",
      borderColor: "border-nexus-blue/30",
      bgAura: "hover:border-nexus-blue/60 hover:bg-nexus-blue/5",
      onClick: () => selectBus(null),
    },
    {
      id: "ONLINE",
      label: "TELEMETRY ONLINE",
      value: onlineCount,
      subValue: "Fix Latency < 15s",
      trend: "99.4% Uptime",
      icon: ShieldCheck,
      color: "text-nexus-safe",
      borderColor: "border-nexus-safe/30",
      bgAura: "hover:border-nexus-safe/60 hover:bg-nexus-safe/5",
      onClick: () => {
        const liveBus = buses.find((b) => b.trackingStatus === "LIVE");
        if (liveBus) selectBus(liveBus.id);
      },
    },
    {
      id: "STALE",
      label: "TRACKING STALE / GAP",
      value: staleBuses.length,
      subValue: "No Fix for > 60s",
      trend: "Investigating",
      icon: Clock,
      color: "text-nexus-warning",
      borderColor: "border-nexus-warning/40",
      bgAura: "hover:border-nexus-warning/70 hover:bg-nexus-warning/10",
      isWarning: staleBuses.length > 0,
      onClick: () => {
        if (staleBuses[0]) selectBus(staleBuses[0].id);
      },
    },
    {
      id: "ALERTS",
      label: "ACTIVE SAFETY ALERTS",
      value: activeIncidentsCount,
      subValue: "Under Triage",
      trend: "Avg Ack: 1.2m",
      icon: AlertTriangle,
      color: "text-nexus-warning",
      borderColor: "border-nexus-warning/30",
      bgAura: "hover:border-nexus-warning/60 hover:bg-nexus-warning/5",
      onClick: () => {
        const firstActive = incidents.find((i) => !["RESOLVED", "CLOSED"].includes(i.status));
        if (firstActive) selectIncident(firstActive.id);
      },
    },
    {
      id: "CRITICAL",
      label: "CRITICAL SOS ALERTS",
      value: criticalIncidentsCount,
      subValue: criticalIncidentsCount > 0 ? "Immediate Priority" : "Zero Unhandled",
      trend: criticalIncidentsCount > 0 ? "ACTIVE SOS" : "CLEAR",
      icon: AlertOctagon,
      color: "text-nexus-critical",
      borderColor: "border-nexus-critical/50",
      bgAura: criticalIncidentsCount > 0 ? "bg-nexus-critical/15 animate-pulse" : "hover:border-nexus-critical/70 hover:bg-nexus-critical/5",
      isCritical: criticalIncidentsCount > 0,
      onClick: () => {
        if (criticalIncident) {
          selectIncident(criticalIncident.id);
          selectBus(criticalIncident.busId);
        }
      },
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            onClick={kpi.onClick}
            className={`p-3.5 rounded-xl border bg-bg-surface ${kpi.borderColor} ${kpi.bgAura} flex flex-col justify-between transition-all cursor-pointer hover:translate-y-[-2px] tech-card shadow-md`}
            title={`Click to inspect ${kpi.label}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-wider text-tx-secondary font-semibold truncate">
                {kpi.label}
              </span>
              <Icon className={`w-4 h-4 ${kpi.color} shrink-0`} />
            </div>

            <div className="my-2">
              <div className="text-2xl font-bold font-mono tracking-tight text-tx-primary flex items-baseline justify-between">
                <span>{kpi.value}</span>
                <span className={`text-[10px] font-mono font-normal ${kpi.isCritical ? "text-nexus-critical font-bold" : "text-tx-muted"}`}>
                  {kpi.trend}
                </span>
              </div>
              <div className="text-[10px] text-tx-muted truncate mt-0.5 font-sans">
                {kpi.subValue}
              </div>
            </div>

            <div className="w-full bg-border/40 h-1 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  kpi.isCritical
                    ? "bg-nexus-critical"
                    : kpi.isWarning
                    ? "bg-nexus-warning"
                    : "bg-nexus-cyan"
                }`}
                style={{ width: `${Math.min(100, (kpi.value / totalRegisteredFleet) * 100 * 5)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
