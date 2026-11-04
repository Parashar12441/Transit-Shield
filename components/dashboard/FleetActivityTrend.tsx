"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Activity, ShieldCheck } from "lucide-react";

const HOURLY_ACTIVITY_DATA = [
  { time: "00:00", trips: 14, alerts: 0, stale: 1 },
  { time: "02:00", trips: 8, alerts: 0, stale: 0 },
  { time: "04:00", trips: 22, alerts: 1, stale: 0 },
  { time: "06:00", trips: 86, alerts: 2, stale: 1 },
  { time: "08:00", trips: 185, alerts: 5, stale: 2 },
  { time: "10:00", trips: 220, alerts: 4, stale: 3 },
  { time: "12:00", trips: 195, alerts: 3, stale: 2 },
  { time: "14:00", trips: 178, alerts: 4, stale: 2 },
  { time: "16:00", trips: 232, alerts: 6, stale: 4 },
  { time: "18:00", trips: 240, alerts: 8, stale: 3 },
  { time: "20:00", trips: 160, alerts: 3, stale: 1 },
  { time: "22:00", trips: 64, alerts: 1, stale: 1 },
];

export function FleetActivityTrend() {
  return (
    <div className="p-4 rounded-xl border border-border bg-bg-surface flex flex-col shadow-lg">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-nexus-cyan" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-tx-primary font-mono">
            24-Hour Telemetry Volume &amp; Safety Events
          </h2>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-nexus-cyan">
            <span className="w-2.5 h-2.5 rounded-full bg-nexus-cyan/80" />
            <span>Active Trips</span>
          </div>
          <div className="flex items-center gap-1.5 text-nexus-critical">
            <span className="w-2.5 h-2.5 rounded-full bg-nexus-critical/80" />
            <span>Safety Alerts</span>
          </div>
        </div>
      </div>

      <div className="h-44 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={HOURLY_ACTIVITY_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tripsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#49D9FF" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#49D9FF" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="alertsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF4D67" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#FF4D67" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2C42" vertical={false} />
            <XAxis dataKey="time" stroke="#8795AA" fontSize={10} tickLine={false} />
            <YAxis stroke="#8795AA" fontSize={10} tickLine={false} axisLine={false} />
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
            <Area
              type="monotone"
              dataKey="trips"
              stroke="#49D9FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#tripsGrad)"
              name="Active Trips"
            />
            <Area
              type="monotone"
              dataKey="alerts"
              stroke="#FF4D67"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#alertsGrad)"
              name="Safety Triggers"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
