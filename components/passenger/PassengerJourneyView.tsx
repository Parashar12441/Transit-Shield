"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/context/AuthContext";
import { useFleet } from "@/lib/context/FleetContext";
import { ROUTE_SCHEDULES } from "@/lib/mock-data/schedules";
import { BusTelemetry } from "@/types";
import {
  Users,
  Clock,
  CreditCard,
  ArrowLeftRight,
  Shield,
  CheckCircle2,
  MapPin,
  Sparkles,
  Radio,
  Calendar,
  Bell,
  BellRing,
  Share2,
  ShieldAlert,
  AlertTriangle,
  QrCode,
  Wifi,
  Thermometer,
  Zap,
  Gauge,
  Volume2,
  ChevronRight,
  Compass,
  Bus,
  Check,
  Copy,
  ExternalLink,
  Info,
} from "lucide-react";

// Dynamically import FleetMap with SSR disabled
const FleetMap = dynamic(() => import("@/components/dashboard/FleetMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[460px] w-full rounded-2xl border border-border bg-bg-surface flex flex-col items-center justify-center text-xs text-tx-muted font-mono animate-pulse gap-2">
      <div className="w-8 h-8 rounded-full border-2 border-nexus-safe border-t-transparent animate-spin" />
      <span>CONNECTING PASSENGER SATELLITE ROAD TELEMETRY...</span>
    </div>
  ),
});

export function PassengerJourneyView() {
  const { currentUser, switchRole } = useAuth();
  const { buses, routes } = useFleet();

  // Find preferred bus based on user's corridor or default to first bus with schedule
  const preferredRouteCode = currentUser?.stationOrLocation?.split(":")[0]?.trim() || "KE-1";
  const matchedRoute = routes.find((r) => r.code === preferredRouteCode) || routes[0];
  const defaultBus =
    buses.find((b) => b.routeId === matchedRoute?.id && b.scheduleStatus) ||
    buses.find((b) => b.scheduleStatus) ||
    buses[0];

  const [activeBusId, setActiveBusId] = useState<string>(defaultBus?.id || "KNP-101");
  const [destinationStop, setDestinationStop] = useState<string>("");
  const [alarmEnabled, setAlarmEnabled] = useState<boolean>(true);
  const [stopRequested, setStopRequested] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [sosConfirmed, setSosConfirmed] = useState<boolean>(false);

  const activeBus: BusTelemetry = buses.find((b) => b.id === activeBusId) || defaultBus || buses[0];
  const activeRoute = routes.find((r) => r.id === activeBus.routeId) || matchedRoute || routes[0];
  const schedule = activeBus.scheduleStatus;

  // Set default destination stop to the last stop on the route
  useEffect(() => {
    if (activeRoute?.stops && activeRoute.stops.length > 0 && !destinationStop) {
      setDestinationStop(activeRoute.stops[activeRoute.stops.length - 1].name);
    }
  }, [activeRoute, destinationStop]);

  // Play stop bell chime using Web Audio API synthesis
  const handleRequestStop = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High chime A5
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5); // Fall to A4
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch {}

    setStopRequested(true);
    setTimeout(() => {
      setStopRequested(false);
    }, 8000);
  };

  // Copy shareable live ride message
  const handleShareRide = () => {
    const text = `🚌 Tracking my Kanpur e-Bus:\n• Bus: ${activeBus.id} (${activeBus.registration})\n• Route: ${activeRoute.code}: ${activeRoute.name}\n• Current Speed: ${activeBus.speedKmh} km/h\n• Next Stop: ${schedule?.nextStop || "In Transit"} (ETA: ~${schedule?.etaNextStopMin || 2} min)\n• Final Destination: ${activeRoute.stops[activeRoute.stops.length - 1]?.name || "IIT Kanpur"}\n• Live on Nexus Transit Portal`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  // Calculate stops remaining to destination
  const stopsList = activeRoute?.stops || [];
  const currentStopIndex = stopsList.findIndex((s) => s.name === schedule?.currentOrPrevStop);
  const destinationStopIndex = stopsList.findIndex((s) => s.name === destinationStop);
  const remainingStopsCount =
    destinationStopIndex >= 0 && currentStopIndex >= 0
      ? Math.max(0, destinationStopIndex - currentStopIndex)
      : destinationStopIndex >= 0
      ? destinationStopIndex
      : 3;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* 1. Commuter Header & Active Bus Switcher Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-nexus-safe/40 bg-gradient-to-r from-bg-surface via-bg-elevated to-bg-surface shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-nexus-safe/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-nexus-safe/20 border border-nexus-safe/50 flex items-center justify-center text-nexus-safe shadow-glow-safe shrink-0">
              <Bus className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-nexus-safe/20 text-nexus-safe border border-nexus-safe/40 font-bold uppercase tracking-wider">
                  Commuter Live Journey
                </span>
                <span className="text-xs font-mono text-tx-muted">Pass ID: {currentUser?.badgeOrId || "KNP-COMM-7702"}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-nexus-cyan/15 text-nexus-cyan border border-nexus-cyan/30 font-semibold">
                  1 Bus Tracking Mode
                </span>
              </div>
              <h2 className="text-lg font-bold text-tx-primary mt-1 font-mono">
                Welcome Onboard, {currentUser?.name || "Commuter"}
              </h2>
              <p className="text-xs text-tx-secondary">
                You are currently tracking your travel on{" "}
                <span className="text-nexus-cyan font-bold font-mono">
                  Bus {activeBus.id} &bull; {activeRoute.code}: {activeRoute.name.split("–")[0].trim()}
                </span>
              </p>
            </div>
          </div>

          {/* Quick Bus Selector & Role Switcher */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono w-full lg:w-auto justify-start lg:justify-end">
            <div className="flex items-center gap-1.5 p-1 px-2 rounded-xl bg-bg-surface/90 border border-border">
              <span className="text-[10px] text-tx-muted uppercase font-bold">Travelling On:</span>
              <select
                value={activeBusId}
                onChange={(e) => setActiveBusId(e.target.value)}
                className="bg-bg-elevated border border-border/80 text-nexus-cyan font-bold rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-nexus-cyan"
                title="Select which bus you are currently riding"
              >
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>
                    {bus.id} ({bus.registration}) &bull; {bus.routeName.split("–")[0]}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => switchRole("OPERATOR")}
              className="py-2 px-3 rounded-xl bg-nexus-cyan/15 hover:bg-nexus-cyan/25 text-nexus-cyan border border-nexus-cyan/40 font-bold flex items-center gap-1.5 transition-all text-xs"
              title="Switch to Full Fleet Operator Console"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Operator Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Onboard Live Ride Hero HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Next Stop Card */}
        <div className="p-4 rounded-xl border border-nexus-safe/40 bg-bg-surface shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-tx-muted">
            <span className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-nexus-safe">
              <span className="w-2 h-2 rounded-full bg-nexus-safe animate-pulse" />
              Next Station
            </span>
            <span className="text-tx-secondary text-[10px]">
              {schedule?.isDwellingAtStop ? "BOARDING NOW" : "IN TRANSIT"}
            </span>
          </div>
          <div className="my-2">
            <div className="text-lg font-bold text-tx-primary font-mono truncate">
              {schedule?.nextStop || "Upcoming Stop"}
            </div>
            <div className="text-xs text-tx-secondary mt-0.5 flex items-center gap-1.5">
              <span>Estimated Arrival:</span>
              <strong className="text-nexus-safe font-mono text-sm">
                ~{schedule?.etaNextStopMin || 2} min
              </strong>
            </div>
          </div>
          <div className="text-[10px] font-mono text-tx-muted border-t border-border/80 pt-2 flex items-center justify-between">
            <span>Previous: {schedule?.currentOrPrevStop || "Terminal"}</span>
            <span className="text-nexus-cyan">Distance: ~450m</span>
          </div>
        </div>

        {/* Bus & Driver Profile */}
        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-tx-muted">
            <span className="uppercase text-[10px] text-nexus-cyan font-bold">Vehicle & Pilot</span>
            <span className="text-[10px] text-nexus-safe font-bold">e-Bus AC</span>
          </div>
          <div className="my-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-tx-primary font-mono">{activeBus.id}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-elevated border border-border text-tx-secondary">
                {activeBus.registration}
              </span>
            </div>
            <div className="text-xs text-tx-secondary mt-1 flex items-center gap-1">
              <span>Driver:</span>
              <span className="text-tx-primary font-bold">{activeBus.driverName}</span>
              <span className="text-yellow-400 text-[11px]">&bull; 4.9 &starf;</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-tx-muted border-t border-border/80 pt-2 flex items-center justify-between">
            <span>Model: Tata Ultra 9/9m</span>
            <span className="text-nexus-safe">Battery: {activeBus.batteryLevel || 84}%</span>
          </div>
        </div>

        {/* Trip Timings & Schedule Adherence */}
        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-tx-muted">
            <span className="uppercase text-[10px] text-tx-muted font-bold">Trip Timings</span>
            <span className="text-[10px] text-nexus-safe font-bold font-mono">
              {schedule?.scheduleAdherence === "ON_TIME" ? "ON SCHEDULE" : "ON SCHEDULE"}
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-tx-muted block">DEPARTED</span>
                <span className="text-sm font-bold text-tx-primary">
                  {schedule?.currentTripDeparture || "09:30 AM"}
                </span>
              </div>
              <div className="text-center text-tx-muted">&rarr;</div>
              <div className="text-right">
                <span className="text-[10px] text-tx-muted block">EXP. DESTINATION</span>
                <span className="text-sm font-bold text-nexus-cyan">
                  {schedule?.currentTripArrival || "10:25 AM"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-tx-muted border-t border-border/80 pt-2 flex items-center justify-between">
            <span>Frequency: Every {schedule?.headwayMinutes || 15}m</span>
            <span className="text-tx-secondary truncate max-w-[130px]">
              End: {activeRoute.stops[activeRoute.stops.length - 1]?.name || "IIT Gate"}
            </span>
          </div>
        </div>

        {/* Onboard Amenities & Speed */}
        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-tx-muted">
            <span className="uppercase text-[10px] text-tx-muted font-bold">Cabin & Comfort</span>
            <span className="text-[10px] text-nexus-safe font-bold flex items-center gap-1">
              <Wifi className="w-3 h-3" /> Free Wi-Fi
            </span>
          </div>
          <div className="my-2 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-tx-muted block">ROAD SPEED</span>
              <span className="text-lg font-bold text-tx-primary font-mono">
                {activeBus.speedKmh}{" "}
                <span className="text-xs font-normal text-tx-muted">km/h</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-tx-muted block">CABIN TEMP</span>
              <span className="text-lg font-bold text-nexus-cyan font-mono flex items-center justify-end gap-0.5">
                <Thermometer className="w-3.5 h-3.5" /> 21&deg;C
              </span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-tx-muted border-t border-border/80 pt-2 flex items-center justify-between">
            <span>Seats Free: ~16</span>
            <span className="text-nexus-safe">CCTV Monitored</span>
          </div>
        </div>
      </div>

      {/* 3. Stop-by-Stop Route Progress Ribbon */}
      <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-nexus-cyan" />
            <span className="text-xs font-mono font-bold text-tx-primary uppercase tracking-wider">
              Corridor Progress Ribbon &bull; {activeRoute.code}: {activeRoute.name}
            </span>
          </div>
          <div className="text-xs font-mono text-tx-muted flex items-center gap-3">
            <span>Stops on Route: {stopsList.length}</span>
            <span>&bull;</span>
            <span className="text-nexus-cyan">Distance: {ROUTE_SCHEDULES[activeRoute.code]?.totalDistanceKm || 23} km</span>
          </div>
        </div>

        {/* Horizontal Visual Stop Ribbon */}
        <div className="overflow-x-auto pb-2 pt-1 scrollbar-thin">
          <div className="flex items-center min-w-[700px] px-2">
            {stopsList.map((stop, idx) => {
              const isPast =
                currentStopIndex >= 0 && idx < currentStopIndex;
              const isCurrent =
                schedule?.currentOrPrevStop === stop.name ||
                (schedule?.nextStop === stop.name && !isPast);
              const isDestination = destinationStop === stop.name;

              return (
                <React.Fragment key={stop.name + idx}>
                  {/* Connecting Polyline Segment */}
                  {idx > 0 && (
                    <div
                      className={`flex-1 h-1 transition-all ${
                        isPast
                          ? "bg-nexus-safe"
                          : isCurrent
                          ? "bg-gradient-to-r from-nexus-safe to-nexus-cyan animate-pulse"
                          : "bg-border-bright"
                      }`}
                    />
                  )}

                  {/* Stop Node */}
                  <div
                    onClick={() => setDestinationStop(stop.name)}
                    className="flex flex-col items-center group cursor-pointer relative shrink-0"
                    title={`Click to set ${stop.name} as my deboarding stop`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all text-[10px] font-mono font-bold ${
                        isCurrent
                          ? "bg-nexus-cyan text-black ring-4 ring-nexus-cyan/30 shadow-glow scale-110"
                          : isPast
                          ? "bg-nexus-safe text-black"
                          : isDestination
                          ? "bg-yellow-400 text-black ring-4 ring-yellow-400/30"
                          : "bg-bg-elevated border border-border text-tx-muted group-hover:border-tx-secondary group-hover:text-tx-primary"
                      }`}
                    >
                      {isPast ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : isCurrent ? (
                        <Bus className="w-3.5 h-3.5 fill-black" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <div className="mt-1.5 text-center max-w-[85px]">
                      <span
                        className={`text-[11px] block font-medium truncate ${
                          isCurrent
                            ? "text-nexus-cyan font-bold"
                            : isDestination
                            ? "text-yellow-400 font-bold"
                            : isPast
                            ? "text-tx-secondary line-through"
                            : "text-tx-muted group-hover:text-tx-primary"
                        }`}
                      >
                        {stop.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-mono text-nexus-safe font-bold block animate-pulse">
                          BUS HERE
                        </span>
                      )}
                      {isDestination && !isCurrent && (
                        <span className="text-[9px] font-mono text-yellow-400 font-bold block">
                          MY STOP
                        </span>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Live Map: Only Tracking This Bus on Its Corridor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-nexus-safe animate-pulse" />
            <span className="text-xs font-mono text-tx-secondary tracking-wider uppercase font-semibold">
              Live Road Track &bull; Bus {activeBus.id} on {activeRoute.code}: {activeRoute.name.split("–")[0]}
            </span>
          </div>
          <span className="text-[11px] font-mono text-nexus-cyan">
            PASSENGER SATELLITE BEACON &bull; 3000ms
          </span>
        </div>

        <FleetMap
          height="460px"
          singleBusId={activeBus.id}
          focusedRouteId={activeBus.routeId}
          passengerMode={true}
        />
      </div>

      {/* 5. Passenger Interactive Options & Smart Travel Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tool 1: Deboarding Stop Alarm */}
        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-tx-primary font-mono uppercase">
                  Deboarding Stop Alarm
                </h4>
                <p className="text-[11px] text-tx-muted">Sound alert before your stop</p>
              </div>
            </div>
            <button
              onClick={() => setAlarmEnabled(!alarmEnabled)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                alarmEnabled
                  ? "bg-nexus-safe/20 text-nexus-safe border border-nexus-safe/40"
                  : "bg-bg-elevated text-tx-muted border border-border"
              }`}
            >
              {alarmEnabled ? "ARMED" : "OFF"}
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <label className="text-[10px] text-tx-muted block mb-1">MY DROP-OFF STOP:</label>
              <select
                value={destinationStop}
                onChange={(e) => setDestinationStop(e.target.value)}
                className="w-full bg-bg-elevated border border-border rounded-lg px-2.5 py-1.5 text-xs text-tx-primary focus:outline-none focus:border-nexus-cyan"
              >
                {stopsList.map((stop, i) => (
                  <option key={stop.name + i} value={stop.name}>
                    Stop {i + 1}: {stop.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-2.5 rounded-lg bg-bg-elevated/70 border border-border/80 text-[11px] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-tx-secondary">Remaining Stops:</span>
                <span className="text-tx-primary font-bold">{remainingStopsCount} stops</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-tx-secondary">Est. Travel Time:</span>
                <span className="text-nexus-cyan font-bold">~{remainingStopsCount * 3} mins</span>
              </div>
            </div>

            {alarmEnabled && (
              <div className="text-[10px] text-nexus-safe flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>We will chime when bus approaches 1 stop prior.</span>
              </div>
            )}
          </div>
        </div>

        {/* Tool 2: Request Stop (Digital Stop Bell) */}
        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-nexus-cyan/20 text-nexus-cyan flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-tx-primary font-mono uppercase">
                Digital Stop Bell
              </h4>
              <p className="text-[11px] text-tx-muted">Notify pilot to stop at next station</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-tx-secondary">
              Signal the pilot console that you or a fellow passenger wish to alight at{" "}
              <strong className="text-white">{schedule?.nextStop || "the next stop"}</strong>.
            </p>

            <button
              onClick={handleRequestStop}
              disabled={stopRequested}
              className={`w-full py-3 px-4 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
                stopRequested
                  ? "bg-nexus-safe text-black shadow-glow-safe"
                  : "bg-nexus-cyan hover:bg-nexus-cyan/90 text-black shadow-glow active:scale-[0.98]"
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>
                {stopRequested
                  ? "✓ STOP REQUEST SENT TO PILOT"
                  : "RING STOP BELL (REQUEST NEXT STOP)"}
              </span>
            </button>

            {stopRequested && (
              <div className="p-2 rounded-lg bg-nexus-safe/10 border border-nexus-safe/30 text-[11px] text-nexus-safe font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pilot console alerted: Stop confirmed at {schedule?.nextStop}.</span>
              </div>
            )}
          </div>
        </div>

        {/* Tool 3: Digital Pass & QR Ticket */}
        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-nexus-blue/20 text-nexus-cyan flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-tx-primary font-mono uppercase">
                  Digital Transit Pass
                </h4>
                <p className="text-[11px] text-tx-muted">Kanpur Chalo Metro & e-Bus</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-nexus-safe/20 text-nexus-safe border border-nexus-safe/40 font-bold">
              ACTIVE
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-bg-elevated/70 border border-border/80 text-xs font-mono space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-tx-secondary">Pass ID:</span>
              <span className="text-tx-primary font-bold">{currentUser?.badgeOrId || "KNP-COMM-7702"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-tx-secondary">Wallet Balance:</span>
              <span className="text-nexus-safe font-bold">₹240.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-tx-secondary">Ride Fare:</span>
              <span className="text-nexus-cyan font-bold">₹25.00 (Standard AC)</span>
            </div>
          </div>

          <button
            onClick={() => setShowQrModal(!showQrModal)}
            className="w-full py-2 px-3 rounded-lg bg-bg-elevated hover:bg-bg-hover text-tx-primary border border-border text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-nexus-cyan" />
            <span>{showQrModal ? "Hide QR Ticket" : "Show QR Ticket for Inspection"}</span>
          </button>
        </div>

        {/* Tool 4: Share Live Ride */}
        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-nexus-cyan/15 text-nexus-cyan flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-tx-primary font-mono uppercase">
                Share Live Trip
              </h4>
              <p className="text-[11px] text-tx-muted">Send live tracking to family & friends</p>
            </div>
          </div>

          <p className="text-xs text-tx-secondary">
            Share your real-time bus position, arrival ETA, and destination details with family
            members.
          </p>

          <button
            onClick={handleShareRide}
            className="w-full py-2.5 px-3 rounded-lg bg-bg-elevated hover:bg-bg-hover text-nexus-cyan border border-nexus-cyan/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-nexus-safe" />
                <span className="text-nexus-safe">Live Ride Details Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Live Tracking Info</span>
              </>
            )}
          </button>
        </div>

        {/* Tool 5: Passenger Safety SOS */}
        <div className="p-4 rounded-xl border border-nexus-critical/30 bg-bg-surface shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-nexus-critical/20 text-nexus-critical flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-tx-primary font-mono uppercase">
                  Passenger Safety SOS
                </h4>
                <p className="text-[11px] text-tx-muted">Kanpur Transport Command</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-tx-secondary space-y-1">
            <div className="flex justify-between">
              <span>Police Helpline:</span>
              <strong className="text-white">112</strong>
            </div>
            <div className="flex justify-between">
              <span>Women Powerline:</span>
              <strong className="text-pink-400">1090</strong>
            </div>
            <div className="flex justify-between">
              <span>Transport Help:</span>
              <strong className="text-nexus-cyan">1073</strong>
            </div>
          </div>

          <button
            onClick={() => {
              setSosActive(true);
              setSosConfirmed(true);
              setTimeout(() => setSosConfirmed(false), 5000);
            }}
            className="w-full py-2.5 px-3 rounded-lg bg-nexus-critical/20 hover:bg-nexus-critical/30 text-nexus-critical border border-nexus-critical/50 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-glow-critical"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{sosConfirmed ? "ALERT SENT TO CONTROL ROOM" : "TRANSMIT EMERGENCY SOS"}</span>
          </button>
        </div>

        {/* Tool 6: Corridor Timetable Quick View */}
        <div className="p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-nexus-safe/20 text-nexus-safe flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-tx-primary font-mono uppercase">
                Service Schedule
              </h4>
              <p className="text-[11px] text-tx-muted">KCTSL e-Bus operations</p>
            </div>
          </div>

          <div className="text-[11px] font-mono text-tx-secondary space-y-1.5 p-2 rounded-lg bg-bg-elevated/70 border border-border">
            <div className="flex justify-between">
              <span className="text-tx-muted">Operating Hours:</span>
              <span className="text-tx-primary font-bold">06:00 AM – 10:30 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tx-muted">Peak Frequency:</span>
              <span className="text-nexus-safe font-bold">Every 15 mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tx-muted">Daily Trips:</span>
              <span className="text-nexus-cyan font-bold">48 Scheduled Departures</span>
            </div>
          </div>

          <button
            onClick={() => (window.location.href = "/routes")}
            className="w-full py-2 px-3 rounded-lg bg-bg-elevated hover:bg-bg-hover text-tx-secondary hover:text-tx-primary border border-border text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Full Timetable & Route Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* QR Ticket Modal / Expanded View */}
      {showQrModal && (
        <div className="p-5 rounded-2xl border border-nexus-cyan/50 bg-bg-surface/95 backdrop-blur-xl shadow-2xl animate-fade-in max-w-md mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-nexus-cyan" />
              <span className="font-bold font-mono text-sm text-tx-primary">
                KANPUR METRO & E-BUS SMART TICKET
              </span>
            </div>
            <button
              onClick={() => setShowQrModal(false)}
              className="text-tx-muted hover:text-white text-xs w-6 h-6 rounded flex items-center justify-center bg-bg-elevated"
            >
              &times;
            </button>
          </div>

          {/* QR Graphic Mockup */}
          <div className="p-6 rounded-xl bg-white flex flex-col items-center justify-center text-black space-y-2">
            <div className="w-40 h-40 border-4 border-black p-2 flex items-center justify-center">
              {/* Scalable QR matrix illustration */}
              <div className="grid grid-cols-6 gap-1 w-full h-full p-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-sm ${
                      (i % 2 === 0 && i % 3 === 0) || i < 6 || i > 30 || i % 7 === 0
                        ? "bg-black"
                        : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-gray-700">
              SCAN FOR CONDUCTOR VALIDATION
            </span>
          </div>

          <div className="text-xs font-mono space-y-1 text-tx-secondary">
            <div className="flex justify-between">
              <span>Cardholder:</span>
              <strong className="text-white">{currentUser?.name || "Commuter"}</strong>
            </div>
            <div className="flex justify-between">
              <span>Token ID:</span>
              <strong className="text-nexus-cyan">#KNP-TKT-99420-E</strong>
            </div>
            <div className="flex justify-between">
              <span>Bus Assigned:</span>
              <strong className="text-white">{activeBus.id} ({activeBus.registration})</strong>
            </div>
            <div className="flex justify-between">
              <span>Valid Until:</span>
              <strong className="text-nexus-safe">Today 11:59 PM</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PassengerJourneyView;
