"use client";

import React from "react";
import Link from "next/link";
import { useFleet } from "@/lib/context/FleetContext";
import { formatAgo, getSeverityBadgeClass, getStatusBadgeClass } from "@/lib/utils";
import { AlertTriangle, Clock, ArrowRight, ShieldAlert, Siren, UserCheck } from "lucide-react";

export function ActiveIncidentsFeed() {
  const { incidents, selectIncident, setEmergencyModalOpen } = useFleet();

  const activeIncidents = incidents
    .filter((i) => !["RESOLVED", "CLOSED"].includes(i.status))
    .slice(0, 6);

  return (
    <div className="p-4 rounded-xl border border-border bg-bg-surface flex flex-col h-full shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-nexus-warning" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-tx-primary font-mono">
            Active Safety Alerts ({activeIncidents.length})
          </h2>
        </div>

        <button
          onClick={() => setEmergencyModalOpen(true)}
          className="text-[11px] font-mono text-nexus-critical hover:underline flex items-center gap-1 font-semibold"
        >
          <Siren className="w-3.5 h-3.5" />
          <span>Simulate SOS</span>
        </button>
      </div>

      {/* Incidents feed list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[380px]">
        {activeIncidents.length === 0 ? (
          <div className="py-14 text-center text-xs text-tx-muted">
            <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-30 text-nexus-safe" />
            All safety triggers cleared. Normal operational parameters.
          </div>
        ) : (
          activeIncidents.map((inc) => (
            <Link
              key={inc.id}
              href="/incidents"
              onClick={() => selectIncident(inc.id)}
              className="p-3 rounded-lg border border-border hover:border-nexus-cyan/50 bg-bg-elevated/60 hover:bg-bg-elevated block transition-all"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${getSeverityBadgeClass(
                    inc.severity
                  )}`}
                >
                  {inc.severity}
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${getStatusBadgeClass(
                      inc.status
                    )}`}
                  >
                    {inc.status}
                  </span>
                  <span className="text-[10px] text-tx-muted font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatAgo(inc.triggeredAt)}
                  </span>
                </div>
              </div>

              <div className="font-semibold text-xs text-tx-primary mb-1 truncate">
                {inc.title}
              </div>

              <div className="flex items-center justify-between text-[11px] text-tx-secondary font-mono">
                <span>
                  BUS: <span className="text-tx-primary font-bold">{inc.busId}</span> ({inc.driverName})
                </span>
                <span className="text-nexus-cyan text-[10px]">
                  {inc.assignedOperator ? inc.assignedOperator : "UNASSIGNED"}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Bottom link to Incident Command */}
      <div className="pt-3 mt-3 border-t border-border/60 flex items-center justify-between text-xs">
        <span className="text-[11px] text-tx-muted font-mono">
          DISPATCH PROTOCOL ACTIVE
        </span>
        <Link
          href="/incidents"
          className="text-xs text-nexus-cyan hover:underline font-semibold flex items-center gap-1"
        >
          <span>Open Incident Command</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
