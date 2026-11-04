"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useFleet } from "@/lib/context/FleetContext";
import { Route } from "@/types";
import { ROUTE_SCHEDULES } from "@/lib/mock-data/schedules";
import {
  GitBranch,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Clock,
  Compass,
  Calendar,
  ExternalLink,
  BookOpen,
} from "lucide-react";

const FleetMap = dynamic(() => import("@/components/dashboard/FleetMap"), {
  ssr: false,
  loading: ({ error }) => (
    <div className="h-[540px] w-full rounded-xl border border-border bg-bg-surface flex flex-col items-center justify-center text-xs text-tx-muted font-mono animate-pulse gap-2">
      <span>CALIBRATING ROUTE GEOMETRY &amp; GEOFENCE VECTORS...</span>
      {error && (
        <span className="text-nexus-critical text-[10px] max-w-md text-center">
          Route map error: {String(error)}
        </span>
      )}
    </div>
  ),
});

export default function RouteIntelligencePage() {
  const { routes, updateRouteConfig, incidents, buses } = useFleet();
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0].id);
  const [activeTab, setActiveTab] = useState<"TIMETABLE" | "SAFETY">("TIMETABLE");
  const [saveMessage, setSaveMessage] = useState<string>("");

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const schedule = ROUTE_SCHEDULES[activeRoute.id];

  const handleUpdate = (key: keyof Route, value: number) => {
    updateRouteConfig(activeRoute.id, { [key]: value });
    setSaveMessage("Threshold updated in local operations cache.");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const routeIncidents = incidents.filter(
    (i) => i.routeId === activeRoute.id || i.routeName.includes(activeRoute.name)
  );

  const routeBuses = buses.filter((b) => b.routeId === activeRoute.id);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-border bg-bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-nexus-cyan" />
            <h2 className="text-base font-bold text-tx-primary font-mono tracking-wide">
              ROUTE INTELLIGENCE &amp; SAFETY GEOFENCES
            </h2>
          </div>
          <p className="text-xs text-tx-secondary mt-0.5">
            Geofence corridors, corridor persistence buffers, and route-specific overspeed limits.
          </p>
        </div>

        {/* Route Selector tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {routes.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRouteId(r.id)}
              className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${
                selectedRouteId === r.id
                  ? "bg-nexus-cyan/20 text-nexus-cyan border-nexus-cyan shadow-glow"
                  : "bg-bg-elevated text-tx-secondary border-border hover:text-tx-primary"
              }`}
            >
              <span style={{ color: r.color }} className="mr-1.5">
                &bull;
              </span>
              {r.code}: {r.name.split("–")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Corridor Map (Left) + Safety Rule Editor & Stops (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Map Column */}
        <div className="lg:col-span-7 space-y-3">
          <FleetMap height="560px" focusedRouteId={selectedRouteId} />
        </div>

        {/* Route Details & Rule Config */}
        <div className="lg:col-span-5 space-y-4">
          {/* Corridor Config Card */}
          <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span
                  style={{ color: activeRoute.color }}
                  className="font-mono text-xs font-bold block"
                >
                  ROUTE {activeRoute.code}
                </span>
                <h3 className="text-sm font-bold text-tx-primary">
                  {activeRoute.name}
                </h3>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-bg-elevated border border-border text-tx-secondary">
                {activeRoute.stops.length} Stops &bull; {routeBuses.length} Active Buses
              </span>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-bg-elevated rounded-lg border border-border text-xs font-mono">
              <button
                onClick={() => setActiveTab("TIMETABLE")}
                className={`flex-1 py-1.5 px-3 rounded text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "TIMETABLE"
                    ? "bg-nexus-cyan/20 text-nexus-cyan border border-nexus-cyan/40 shadow-glow"
                    : "text-tx-secondary hover:text-tx-primary"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Timetable &amp; Schedule</span>
              </button>
              <button
                onClick={() => setActiveTab("SAFETY")}
                className={`flex-1 py-1.5 px-3 rounded text-center font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "SAFETY"
                    ? "bg-nexus-cyan/20 text-nexus-cyan border border-nexus-cyan/40 shadow-glow"
                    : "text-tx-secondary hover:text-tx-primary"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Safety Corridors</span>
              </button>
            </div>

            {activeTab === "TIMETABLE" ? (
              <div className="space-y-4">
                {/* Key Operating Hours & Headway Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-bg-elevated/70 border border-border">
                    <span className="text-[10px] text-tx-muted block">FIRST / LAST BUS</span>
                    <div className="font-bold text-tx-primary mt-0.5">
                      {schedule?.operatingHours.firstBus} – {schedule?.operatingHours.lastBus}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-bg-elevated/70 border border-border">
                    <span className="text-[10px] text-tx-muted block">FREQUENCY / HEADWAY</span>
                    <div className="font-bold text-nexus-cyan mt-0.5">
                      Every {schedule?.peakFrequencyMin || 10}–{schedule?.offPeakFrequencyMin || 15} mins
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-bg-elevated/70 border border-border">
                    <span className="text-[10px] text-tx-muted block">ONE-WAY RUNTIME</span>
                    <div className="font-bold text-tx-primary mt-0.5">
                      ~{schedule?.tripDurationMin || 55} mins ({schedule?.totalDistanceKm || 23} km)
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-bg-elevated/70 border border-border">
                    <span className="text-[10px] text-tx-muted block">DAILY TRIPS</span>
                    <div className="font-bold text-nexus-safe mt-0.5">
                      {schedule?.dailyDepartures.length || 40} Scheduled Services
                    </div>
                  </div>
                </div>

                {/* Verified Transit Sources */}
                {schedule?.sources && (
                  <div className="p-3 rounded-lg bg-bg-elevated/50 border border-border/80 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-tx-secondary font-mono text-[11px] font-bold">
                      <BookOpen className="w-3.5 h-3.5 text-nexus-cyan" />
                      <span>Verified Transit Source Data</span>
                    </div>
                    {schedule.sources.map((src, idx) => (
                      <div key={idx} className="text-[11px] border-t border-border/40 pt-1.5 mt-1">
                        <div className="font-bold text-tx-primary flex items-center justify-between">
                          <span>{src.publisher}: {src.title}</span>
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-nexus-cyan hover:underline inline-flex items-center gap-0.5 text-[10px]"
                            >
                              Source <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                        <div className="text-[10px] text-tx-muted mt-0.5">{src.verificationNotes}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Daily Scheduled Departures */}
                {schedule?.dailyDepartures && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-tx-secondary">
                      <span className="flex items-center gap-1 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-nexus-cyan" />
                        Daily Terminal Departure Schedule ({schedule.dailyDepartures.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto p-2 bg-bg-elevated/60 border border-border rounded-lg font-mono text-[11px]">
                      {schedule.dailyDepartures.map((time, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-bg-surface border border-border text-tx-secondary hover:text-nexus-cyan hover:border-nexus-cyan transition-colors"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Configurable Thresholds */
              <div className="space-y-3 text-xs">
                <h4 className="font-mono text-tx-secondary text-[11px] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-nexus-cyan" />
                  Active Safety Parameters (Interactive)
                </h4>

                {/* Speed limit */}
                <div className="p-3 rounded-lg bg-bg-elevated border border-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-tx-primary">Speed Ceiling</div>
                    <div className="text-[10px] text-tx-muted">Triggers overspeed warning if exceeded</div>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <input
                      type="number"
                      min={20}
                      max={90}
                      value={activeRoute.speedLimitKmh}
                      onChange={(e) => handleUpdate("speedLimitKmh", Number(e.target.value))}
                      className="w-16 bg-bg-surface border border-border rounded px-2 py-1 text-center text-xs font-bold text-tx-primary focus:outline-none focus:border-nexus-cyan"
                    />
                    <span className="text-tx-secondary text-[11px]">km/h</span>
                  </div>
                </div>

                {/* Deviation Corridor */}
                <div className="p-3 rounded-lg bg-bg-elevated border border-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-tx-primary">Corridor Buffer Width</div>
                    <div className="text-[10px] text-tx-muted">Permitted lateral tolerance around route</div>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <input
                      type="number"
                      min={50}
                      max={500}
                      step={10}
                      value={activeRoute.deviationCorridorMeters}
                      onChange={(e) => handleUpdate("deviationCorridorMeters", Number(e.target.value))}
                      className="w-16 bg-bg-surface border border-border rounded px-2 py-1 text-center text-xs font-bold text-tx-primary focus:outline-none focus:border-nexus-cyan"
                    />
                    <span className="text-tx-secondary text-[11px]">meters</span>
                  </div>
                </div>

                {/* Persistence Threshold */}
                <div className="p-3 rounded-lg bg-bg-elevated border border-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-tx-primary">Deviation Persistence</div>
                    <div className="text-[10px] text-tx-muted">Time buffer before trigger to filter GPS noise</div>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <input
                      type="number"
                      min={10}
                      max={120}
                      step={5}
                      value={activeRoute.deviationPersistenceSec}
                      onChange={(e) => handleUpdate("deviationPersistenceSec", Number(e.target.value))}
                      className="w-16 bg-bg-surface border border-border rounded px-2 py-1 text-center text-xs font-bold text-tx-primary focus:outline-none focus:border-nexus-cyan"
                    />
                    <span className="text-tx-secondary text-[11px]">sec</span>
                  </div>
                </div>

                {/* Unplanned Stop Duration */}
                <div className="p-3 rounded-lg bg-bg-elevated border border-border flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-tx-primary">Unplanned Stop Threshold</div>
                    <div className="text-[10px] text-tx-muted">Max stationary dwell outside known stops</div>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={activeRoute.unplannedStopThresholdMin}
                      onChange={(e) => handleUpdate("unplannedStopThresholdMin", Number(e.target.value))}
                      className="w-16 bg-bg-surface border border-border rounded px-2 py-1 text-center text-xs font-bold text-tx-primary focus:outline-none focus:border-nexus-cyan"
                    />
                    <span className="text-tx-secondary text-[11px]">min</span>
                  </div>
                </div>

                {saveMessage && (
                  <div className="p-2 rounded bg-nexus-safe/10 border border-nexus-safe/30 text-[11px] text-nexus-safe flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{saveMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stops List with Scheduled Timings Offset */}
          <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-tx-secondary text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-nexus-cyan" />
                Official Corridor Stops &amp; Timetable Offsets ({activeRoute.stops.length})
              </h4>
              <span className="text-[10px] font-mono text-nexus-cyan">Runtime: ~{schedule?.tripDurationMin || 55}m</span>
            </div>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {(schedule?.stops || []).map((stop) => {
                const isBusHere = routeBuses.some(
                  (b) => b.scheduleStatus?.nextStop === stop.stopName
                );

                return (
                  <div
                    key={stop.stopId}
                    className={`p-2.5 rounded-lg border text-xs flex items-center justify-between font-mono transition-colors ${
                      isBusHere
                        ? "bg-nexus-cyan/15 border-nexus-cyan/60 shadow-glow"
                        : "bg-bg-elevated/70 border-border"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-nexus-blue/20 text-nexus-cyan border border-nexus-cyan/40 text-[10px] font-bold flex items-center justify-center shrink-0">
                        {stop.sequence}
                      </span>
                      <span className="font-sans font-semibold text-tx-primary truncate">
                        {stop.stopName}
                      </span>
                      {isBusHere && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-nexus-cyan/20 text-nexus-cyan border border-nexus-cyan/40 font-bold shrink-0">
                          BUS APPROACHING
                        </span>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold text-nexus-cyan">
                        +{stop.offsetMinutes} min
                      </div>
                      <div className="text-[9px] text-tx-muted">
                        Dwell: ~{stop.expectedDwellSec}s
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
