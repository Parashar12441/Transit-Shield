"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, CheckCheck, Bell, AlertTriangle, ShieldAlert, Clock } from "lucide-react";
import { useFleet } from "@/lib/context/FleetContext";
import { formatAgo, getSeverityBadgeClass } from "@/lib/utils";

export function NotificationDrawer() {
  const {
    notifications,
    isNotificationDrawerOpen,
    setNotificationDrawerOpen,
    markNotificationRead,
    markAllNotificationsRead,
    selectIncident,
  } = useFleet();

  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "CRITICAL">("ALL");

  if (!isNotificationDrawerOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.read;
    if (filter === "CRITICAL") return n.severity === "CRITICAL";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-bg-surface border-l border-border h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-nexus-cyan" />
            <h2 className="font-semibold text-sm text-tx-primary tracking-wide">
              Safety Dispatch Notifications
            </h2>
          </div>
          <button
            onClick={() => setNotificationDrawerOpen(false)}
            className="p-1 rounded-lg hover:bg-bg-elevated text-tx-muted hover:text-tx-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-4 py-2.5 border-b border-border/70 flex items-center justify-between bg-bg-elevated/40 text-xs">
          <div className="flex items-center gap-1">
            {(["ALL", "UNREAD", "CRITICAL"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                  filter === tab
                    ? "bg-nexus-cyan/20 text-nexus-cyan border border-nexus-cyan/40"
                    : "text-tx-secondary hover:text-tx-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1 text-[11px] text-tx-secondary hover:text-nexus-cyan transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-tx-muted text-xs">
              <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No notifications matching current filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationRead(item.id);
                  selectIncident(item.incidentId);
                }}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                  item.read
                    ? "bg-bg-elevated/40 border-border text-tx-secondary"
                    : "bg-bg-elevated border-border-bright text-tx-primary shadow-sm"
                } hover:border-nexus-cyan/50`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${getSeverityBadgeClass(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                  <span className="text-[10px] text-tx-muted font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatAgo(item.timestamp)}
                  </span>
                </div>

                <div className="font-semibold text-[13px] mb-1">{item.title}</div>
                <div className="text-tx-secondary text-[11px] leading-relaxed mb-2">
                  {item.message}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] font-mono">
                  <span className="text-nexus-cyan">BUS: {item.busId}</span>
                  <Link
                    href="/incidents"
                    onClick={() => {
                      setNotificationDrawerOpen(false);
                      selectIncident(item.incidentId);
                    }}
                    className="text-nexus-blue hover:underline flex items-center gap-1 font-sans"
                  >
                    View in Incident Command &rarr;
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
