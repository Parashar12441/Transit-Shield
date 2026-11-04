"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useFleet } from "@/lib/context/FleetContext";
import { useAuth } from "@/lib/context/AuthContext";
import { formatAgo } from "@/lib/utils";
import {
  Map,
  Search,
  Layers,
  Radio,
  Clock,
  Gauge,
  Navigation,
  User,
  ShieldAlert,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  Activity,
} from "lucide-react";

const FleetMap = dynamic(() => import("@/components/dashboard/FleetMap"), {
  ssr: false,
  loading: ({ error }) => (
    <div className="h-[680px] w-full rounded-xl border border-border bg-bg-surface flex flex-col items-center justify-center text-xs text-tx-muted font-mono animate-pulse gap-2">
      <span>CALIBRATING LIVE LEAFLET GEOSPATIAL FLEET SENSORS...</span>
      {error && (
        <span className="text-nexus-critical text-[10px] max-w-md text-center">
          Sensor link error: {String(error)}
        </span>
      )}
    </div>
  ),
});

export default function LiveFleetMapPage() {
  const { buses, routes, selectedBusId, selectBus, incidents, telemetryMode } = useFleet();
  const { userRole, currentUser } = useAuth();
  const isUserMode = userRole === "USER";

  const [routeFilter, setRouteFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(false);

  const activeUserBusId = selectedBusId || buses[0]?.id || "KNP-101";
  const selectedBus = buses.find((b) => b.id === (isUserMode ? activeUserBusId : selectedBusId));

  const filteredBuses = buses.filter((bus) => {
    if (routeFilter !== "ALL" && bus.routeId !== routeFilter) return false;
    if (statusFilter !== "ALL" && bus.trackingStatus !== statusFilter) return false;
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
    <div className="space-y-4 animate-fade-in">
      {/* Top Map Controls Header Bar */}
      <div className="p-4 rounded-xl border border-border bg-bg-surface flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-nexus-cyan/15 border border-nexus-cyan/40 flex items-center justify-center text-nexus-cyan shadow-glow">
            <Map className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-tx-primary font-mono tracking-wide">
                {isUserMode ? "LIVE PASSENGER BUS TRACKER &bull; ROAD VIEW" : "LIVE FLEET GEOSPATIAL MAP &bull; LEAFLET ENGINE"}
              </h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                isUserMode
                  ? "bg-nexus-cyan/15 text-nexus-cyan border-nexus-cyan/40"
                  : "bg-nexus-safe/15 text-nexus-safe border-nexus-safe/40"
              }`}>
                {isUserMode ? `ONBOARD BUS ${activeUserBusId}` : "100% FREE LEAFLET &bull; ZERO API KEY"}
              </span>
            </div>
            <div className="text-[11px] text-tx-secondary font-mono mt-0.5 flex items-center gap-2">
              {isUserMode ? (
                <>
                  <span className="text-nexus-safe font-bold">1 BUS TRACK ACTIVE</span>
                  <span>&bull;</span>
                  <span className="text-tx-secondary">Route: {selectedBus?.routeName?.split("–")[0]}</span>
                  <span>&bull;</span>
                  <span className="text-nexus-cyan">Speed: {selectedBus?.speedKmh || 0} km/h</span>
                </>
              ) : (
                <>
                  <span>VEHICLES: {buses.length}</span>
                  <span>&bull;</span>
                  <span className="text-nexus-safe">ONLINE: {buses.filter((b) => b.trackingStatus === "LIVE").length}</span>
                  <span>&bull;</span>
                  <span className="text-nexus-cyan">MODE: {telemetryMode}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filters & Map Layout Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="bg-bg-elevated border border-border rounded-lg px-3 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan"
          >
            <option value="ALL">All Routes ({routes.length})</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code}: {r.name}
              </option>
            ))}
          </select>

          {!isUserMode && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-bg-elevated border border-border rounded-lg px-3 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan"
            >
              <option value="ALL">All Statuses</option>
              <option value="LIVE">LIVE Beacons Only</option>
              <option value="STALE">STALE Fixes Only</option>
            </select>
          )}

          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="px-3.5 py-1.5 rounded-lg bg-bg-elevated hover:bg-bg-hover text-nexus-cyan border border-border text-xs transition-colors flex items-center gap-1.5 font-semibold"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isPanelCollapsed ? "Show Bus Telemetry Drawer" : "Expand Fullscreen Map"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Full Height Interactive Leaflet Map + Collapsible Bus Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Interactive Leaflet Map Column */}
        <div className={isPanelCollapsed ? "lg:col-span-12" : "lg:col-span-8"}>
          <FleetMap
            height="680px"
            singleBusId={isUserMode ? activeUserBusId : undefined}
            focusedRouteId={isUserMode ? selectedBus?.routeId : (routeFilter === "ALL" ? undefined : routeFilter)}
            passengerMode={isUserMode}
          />
        </div>

        {/* Bus Drawer Column */}
        {!isPanelCollapsed && (
          <div className="lg:col-span-4 space-y-4">
            {/* Search */}
            <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-nexus-cyan" />
                  {isUserMode ? `Select Your Bus (${filteredBuses.length})` : `Active Beacons (${filteredBuses.length})`}
                </span>
                <span className="text-[10px] font-mono text-tx-muted">
                  {isUserMode ? "Click bus to board and track" : "Click bus to lock camera"}
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-tx-muted" />
                <input
                  type="text"
                  placeholder="Filter bus ID, driver, or plate..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-tx-primary placeholder:text-tx-muted focus:outline-none focus:border-nexus-cyan font-sans"
                />
              </div>

              {/* Scrollable bus list */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredBuses.map((bus) => {
                  const isSelected = selectedBusId === bus.id;
                  const hasIncident = incidents.some(
                    (i) => i.busId === bus.id && !["RESOLVED", "CLOSED"].includes(i.status)
                  );

                  return (
                    <div
                      key={bus.id}
                      onClick={() => selectBus(bus.id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between ${isSelected
                          ? "bg-nexus-cyan/15 border-nexus-cyan shadow-glow"
                          : "bg-bg-elevated/70 border-border hover:border-border-bright"
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${hasIncident
                              ? "bg-nexus-critical shadow-glow-critical animate-pulse"
                              : bus.trackingStatus === "STALE"
                                ? "bg-nexus-warning shadow-glow-warning"
                                : "bg-nexus-safe shadow-glow-safe"
                            }`}
                        />
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-tx-primary">
                            {bus.id}{" "}
                            <span className="font-normal text-tx-muted text-[11px]">
                              {bus.registration}
                            </span>
                          </div>
                          <div className="text-[11px] text-tx-secondary truncate font-sans">
                            {bus.driverName} &bull; {bus.routeName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono text-[11px] shrink-0">
                        <div className="font-bold text-tx-primary">{bus.speedKmh} km/h</div>
                        <div className="text-[10px] text-tx-muted">{formatAgo(bus.lastSeenMs)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Bus Inspection Drawer */}
            {selectedBus && (
              <div className="p-4 rounded-xl border border-nexus-cyan/40 bg-bg-surface space-y-3 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <div>
                    <h3 className="text-sm font-bold font-mono text-tx-primary flex items-center gap-2">
                      <span>{selectedBus.id}</span>
                      <span className="text-[11px] text-nexus-cyan">
                        {selectedBus.registration}
                      </span>
                    </h3>
                    <div className="text-[11px] text-tx-secondary">
                      Driver: <span className="text-tx-primary font-semibold">{selectedBus.driverName}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${selectedBus.trackingStatus === "LIVE"
                        ? "bg-nexus-safe/20 text-nexus-safe border border-nexus-safe/50"
                        : "bg-nexus-warning/20 text-nexus-warning border border-nexus-warning/50"
                      }`}
                  >
                    {selectedBus.trackingStatus}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[11px] font-mono text-tx-secondary mb-1">
                    <span>Route Trip Trajectory</span>
                    <span className="text-nexus-cyan font-bold">{selectedBus.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-border h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-nexus-cyan h-full transition-all duration-500 shadow-glow"
                      style={{ width: `${selectedBus.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-bg-elevated border border-border">
                    <span className="text-[10px] text-tx-muted block">SPEED</span>
                    <span className="text-sm font-bold text-tx-primary">{selectedBus.speedKmh} km/h</span>
                  </div>
                  <div className="p-2 rounded bg-bg-elevated border border-border">
                    <span className="text-[10px] text-tx-muted block">ROAD HEADING</span>
                    <span className="text-sm font-bold text-nexus-cyan">{selectedBus.headingDeg}&deg;</span>
                  </div>
                  <div className="p-2 rounded bg-bg-elevated border border-border">
                    <span className="text-[10px] text-tx-muted block">GPS ACCURACY</span>
                    <span className="text-xs font-semibold text-tx-primary">&plusmn;{selectedBus.gpsAccuracyMeters}m</span>
                  </div>
                  <div className="p-2 rounded bg-bg-elevated border border-border">
                    <span className="text-[10px] text-tx-muted block">LAST HEARTBEAT</span>
                    <span className="text-xs font-semibold text-tx-primary">{formatAgo(selectedBus.lastSeenMs)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
