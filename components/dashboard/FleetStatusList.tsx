"use client";

import React, { useState } from "react";
import { useFleet } from "@/lib/context/FleetContext";
import { formatAgo, getTrackingStatusBadgeClass } from "@/lib/utils";
import { Search, Radio, Clock, AlertTriangle, ShieldCheck, ChevronRight } from "lucide-react";

export function FleetStatusList() {
  const { buses, selectedBusId, selectBus, incidents } = useFleet();
  const [filter, setFilter] = useState<"ALL" | "LIVE" | "STALE" | "INCIDENT">("ALL");
  const [search, setSearch] = useState("");

  const filteredBuses = buses.filter((bus) => {
    const hasCritical = incidents.some(
      (i) => i.busId === bus.id && !["RESOLVED", "CLOSED"].includes(i.status)
    );

    if (filter === "LIVE" && bus.trackingStatus !== "LIVE") return false;
    if (filter === "STALE" && bus.trackingStatus !== "STALE") return false;
    if (filter === "INCIDENT" && !hasCritical) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        bus.id.toLowerCase().includes(q) ||
        bus.registration.toLowerCase().includes(q) ||
        bus.driverName.toLowerCase().includes(q) ||
        bus.routeName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-4 rounded-xl border border-border bg-bg-surface flex flex-col h-full shadow-lg">
      {/* Header & Controls */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-nexus-cyan" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-tx-primary font-mono">
            Active Fleet Telemetry ({buses.length})
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          {(["ALL", "LIVE", "STALE", "INCIDENT"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                filter === tab
                  ? "bg-nexus-cyan/20 text-nexus-cyan border border-nexus-cyan/40"
                  : "text-tx-muted hover:text-tx-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
        <input
          type="text"
          placeholder="Filter by bus, driver, or route..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-bg-elevated border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none focus:border-nexus-cyan/50 font-sans"
        />
      </div>

      {/* Bus rows list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[380px]">
        {filteredBuses.length === 0 ? (
          <div className="py-12 text-center text-xs text-tx-muted">
            No active fleet vehicles match current criteria.
          </div>
        ) : (
          filteredBuses.map((bus) => {
            const isSelected = selectedBusId === bus.id;
            const hasIncident = incidents.some(
              (i) => i.busId === bus.id && !["RESOLVED", "CLOSED"].includes(i.status)
            );

            return (
              <div
                key={bus.id}
                onClick={() => selectBus(bus.id)}
                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-nexus-cyan/15 border-nexus-cyan shadow-glow"
                    : "bg-bg-elevated/60 border-border hover:border-border-bright hover:bg-bg-elevated"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Status Indicator Dot */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      hasIncident
                        ? "bg-nexus-critical shadow-glow-critical animate-pulse"
                        : bus.trackingStatus === "STALE"
                        ? "bg-nexus-warning shadow-glow-warning"
                        : "bg-nexus-safe shadow-glow-safe"
                    }`}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono text-tx-primary">
                        {bus.id}
                      </span>
                      <span className="text-[11px] text-tx-muted truncate">
                        {bus.registration}
                      </span>
                      {hasIncident && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-nexus-critical/20 text-nexus-critical border border-nexus-critical/40 font-bold">
                          ALERT
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-tx-secondary truncate font-sans">
                      {bus.driverName} •{" "}
                      <span className="text-tx-muted font-mono">{bus.routeName}</span>
                    </div>

                    {bus.scheduleStatus && (
                      <div className="text-[10px] font-mono text-tx-muted mt-0.5 flex items-center gap-1.5 truncate">
                        <Clock className="w-2.5 h-2.5 text-nexus-cyan shrink-0" />
                        <span className="text-nexus-cyan font-bold">
                          {bus.scheduleStatus.isDwellingAtStop
                            ? `Boarding at ${bus.scheduleStatus.dwellingStopName}`
                            : `→ ${bus.scheduleStatus.nextStop} (~${bus.scheduleStatus.etaNextStopMin}m)`}
                        </span>
                        <span className="text-tx-muted">&bull; Dep: {bus.scheduleStatus.currentTripDeparture}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right font-mono">
                  <div>
                    <div className="font-bold text-tx-primary text-xs">
                      {bus.speedKmh} km/h
                    </div>
                    <div className="text-[10px] text-tx-muted">
                      {formatAgo(bus.lastSeenMs)}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-tx-muted" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
