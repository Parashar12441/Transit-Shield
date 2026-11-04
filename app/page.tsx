"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/context/AuthContext";
import { useFleet } from "@/lib/context/FleetContext";
import { KpiWidgets } from "@/components/dashboard/KpiWidgets";
import { FleetStatusList } from "@/components/dashboard/FleetStatusList";
import { ActiveIncidentsFeed } from "@/components/dashboard/ActiveIncidentsFeed";
import { FleetActivityTrend } from "@/components/dashboard/FleetActivityTrend";
import { PassengerJourneyView } from "@/components/passenger/PassengerJourneyView";
import {
  Users,
  Navigation,
  Clock,
  CreditCard,
  ArrowLeftRight,
  Shield,
  CheckCircle2,
  MapPin,
  Sparkles,
  Radio,
  Calendar,
} from "lucide-react";

// Dynamically import map with SSR disabled to prevent Leaflet window errors
const FleetMap = dynamic(() => import("@/components/dashboard/FleetMap"), {
  ssr: false,
  loading: ({ error }) => (
    <div className="h-[520px] w-full rounded-xl border border-border bg-bg-surface flex flex-col items-center justify-center text-xs text-tx-muted font-mono animate-pulse gap-2">
      <span>INITIALIZING SATELLITE GEOSPATIAL ENGINE...</span>
      {error && (
        <span className="text-nexus-critical text-[10px] max-w-md text-center">
          Engine error: {String(error)}
        </span>
      )}
    </div>
  ),
});

export default function OverviewPage() {
  const { userRole } = useAuth();

  // If logged in as USER / Commuter, present the single-bus live travel experience
  if (userRole === "USER") {
    return <PassengerJourneyView />;
  }

  // Operator Command Center view
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Telemetry KPIs */}
      <KpiWidgets />

      {/* Main Grid: Live Map + Active Alerts Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-tx-secondary tracking-wider uppercase font-semibold">
              Live Fleet Telemetry &bull; Kanpur Metropolitan Corridor
            </span>
            <span className="text-[11px] font-mono text-nexus-cyan">
              GPS BEACON FREQUENCY: 3000ms
            </span>
          </div>
          <FleetMap height="500px" />
        </div>

        <div className="xl:col-span-1">
          <ActiveIncidentsFeed />
        </div>
      </div>

      {/* Lower Grid: Bus Status List + 24-Hour Telemetry Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <FleetStatusList />
        <FleetActivityTrend />
      </div>
    </div>
  );
}
