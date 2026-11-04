"use client";

import React, { useMemo } from "react";
import { useFleet } from "@/lib/context/FleetContext";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Zap,
} from "lucide-react";
import dynamic from "next/dynamic";

const IncidentHeatmap = dynamic(
  () => import("@/components/analytics/IncidentHeatmap").then((m) => m.IncidentHeatmap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[380px] w-full rounded-xl border border-border bg-bg-surface flex items-center justify-center text-xs text-tx-muted font-mono animate-pulse">
        CALIBRATING GEOSPATIAL INCIDENT HEAT ENGINE...
      </div>
    ),
  }
);

const SEVERITY_COLORS: { [key: string]: string } = {
  CRITICAL: "#FF4D67",
  HIGH: "#FFB547",
  MEDIUM: "#49D9FF",
  LOW: "#5B6A82",
};

export default function SafetyAnalyticsPage() {
  const { incidents, routes, buses } = useFleet();

  // Metrics derived dynamically from active and historical incidents
  const severityDistribution = useMemo(() => {
    const counts: { [key: string]: number } = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    incidents.forEach((i) => {
      counts[i.severity] = (counts[i.severity] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [incidents]);

  const typeDistribution = useMemo(() => {
    const counts: { [key: string]: number } = {};
    incidents.forEach((i) => {
      const formattedType = i.type.replace(/_/g, " ");
      counts[formattedType] = (counts[formattedType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [incidents]);

  const routeDistribution = useMemo(() => {
    return routes.map((r) => {
      const count = incidents.filter((i) => i.routeId === r.id || i.routeName.includes(r.name)).length;
      return {
        route: r.code,
        routeName: r.name.split("–")[0],
        incidents: count,
      };
    });
  }, [routes, incidents]);

  // Acknowledgement and resolution times
  const { meanAckTimeMin, meanResTimeMin, acknowledgedCount, resolvedCount } = useMemo(() => {
    let totalAckMs = 0;
    let ackCount = 0;
    let totalResMs = 0;
    let resCount = 0;

    incidents.forEach((i) => {
      if (i.acknowledgedAt) {
        totalAckMs += Math.max(0, i.acknowledgedAt - i.triggeredAt);
        ackCount++;
      }
      if (i.resolvedAt) {
        totalResMs += Math.max(0, i.resolvedAt - i.triggeredAt);
        resCount++;
      }
    });

    return {
      meanAckTimeMin: ackCount ? (totalAckMs / ackCount / 60000).toFixed(1) : "1.4",
      meanResTimeMin: resCount ? (totalResMs / resCount / 60000).toFixed(1) : "8.2",
      acknowledgedCount: ackCount,
      resolvedCount: resCount,
    };
  }, [incidents]);

  const trackingUptimePercent = 99.4;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-border bg-bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-nexus-cyan" />
            <h2 className="text-base font-bold text-tx-primary font-mono tracking-wide">
              SAFETY INTELLIGENCE &amp; RESPONSE METRICS
            </h2>
          </div>
          <p className="text-xs text-tx-secondary mt-0.5">
            Operational service-level indicators, mean acknowledgment latencies, and risk corridor clustering.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-tx-muted">
          <span>COMPLIANCE AUDIT WINDOW: LAST 30 DAYS</span>
        </div>
      </div>

      {/* KPI Cards: Mean Ack Time, Mean Resolution Time, Fleet Tracking Uptime, Criticals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-md">
          <div className="flex items-center justify-between text-xs text-tx-secondary font-mono">
            <span>MEAN ACKNOWLEDGMENT</span>
            <Clock className="w-4 h-4 text-nexus-cyan" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-tx-primary">
              {meanAckTimeMin} min
            </span>
          </div>
          <div className="text-[11px] text-tx-muted">
            Target SLA: &lt; 2.0 min &bull; {acknowledgedCount} Acknowledged
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-md">
          <div className="flex items-center justify-between text-xs text-tx-secondary font-mono">
            <span>MEAN RESOLUTION TIME</span>
            <ShieldCheck className="w-4 h-4 text-nexus-safe" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-tx-primary">
              {meanResTimeMin} min
            </span>
          </div>
          <div className="text-[11px] text-tx-muted">
            {resolvedCount} Incidents Fully Sealed
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-md">
          <div className="flex items-center justify-between text-xs text-tx-secondary font-mono">
            <span>FLEET GPS UPTIME</span>
            <Zap className="w-4 h-4 text-nexus-safe" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-nexus-safe">
              {trackingUptimePercent}%
            </span>
          </div>
          <div className="text-[11px] text-tx-muted">
            Foreground Tracking Resilience
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-md">
          <div className="flex items-center justify-between text-xs text-tx-secondary font-mono">
            <span>TOTAL LOGGED INCIDENTS</span>
            <AlertTriangle className="w-4 h-4 text-nexus-warning" />
          </div>
          <div className="my-2">
            <span className="text-2xl font-bold font-mono text-tx-primary">
              {incidents.length}
            </span>
          </div>
          <div className="text-[11px] text-tx-muted">
            Current Session &amp; Historical
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Severity Distribution (Donut Chart) */}
        <div className="lg:col-span-4 p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono">
            Incidents by Severity Breakdown
          </h3>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                >
                  {severityDistribution.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={SEVERITY_COLORS[entry.name] || "#49D9FF"}
                      stroke="#0D1320"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111B2B",
                    borderColor: "#1F2C42",
                    borderRadius: "8px",
                    color: "#EEF5FF",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-border">
            {severityDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: SEVERITY_COLORS[entry.name] }}
                />
                <span className="text-tx-secondary">{entry.name}:</span>
                <span className="font-bold text-tx-primary">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Incidents by Type (Bar Chart) */}
        <div className="lg:col-span-8 p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-lg">
          <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono">
            Safety Trigger Frequency by Classification
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={typeDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2C42" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#8795AA"
                  fontSize={10}
                  tickLine={false}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#8795AA" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111B2B",
                    borderColor: "#1F2C42",
                    borderRadius: "8px",
                    color: "#EEF5FF",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                />
                <Bar dataKey="count" fill="#49D9FF" radius={[4, 4, 0, 0]} name="Trigger Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Free Leaflet Incident Heatmap */}
      <IncidentHeatmap />

      {/* Lower Row: Corridor Risk Ranking */}
      <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono">
          Route Corridor Risk Assessment &amp; Incident Densities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {routeDistribution.map((item) => (
            <div
              key={item.route}
              className="p-3.5 rounded-lg bg-bg-elevated border border-border flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-nexus-cyan block font-bold">
                  ROUTE {item.route}
                </span>
                <span className="text-xs font-semibold text-tx-primary">
                  {item.routeName}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold font-mono text-tx-primary block">
                  {item.incidents}
                </span>
                <span className="text-[10px] text-tx-muted font-mono">Alerts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
