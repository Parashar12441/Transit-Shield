"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Maximize2,
  Minimize2,
  Navigation,
  LocateFixed,
  HelpCircle,
  PhoneCall,
} from "lucide-react";

// Dynamically import FleetMap with SSR disabled
const FleetMap = dynamic(() => import("@/components/dashboard/FleetMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] sm:h-[420px] w-full rounded-2xl border border-border bg-bg-surface flex flex-col items-center justify-center text-xs text-tx-muted font-mono animate-pulse gap-2">
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
  const [sosConfirmed, setSosConfirmed] = useState<boolean>(false);
  const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<"ALARM" | "TICKET" | "SAFETY" | "INFO">("ALARM");

  const ribbonScrollRef = useRef<HTMLDivElement>(null);

  const activeBus: BusTelemetry = buses.find((b) => b.id === activeBusId) || defaultBus || buses[0];
  const activeRoute = routes.find((r) => r.id === activeBus.routeId) || matchedRoute || routes[0];
  const schedule = activeBus.scheduleStatus;

  // Set default destination stop to the last stop on the route
  useEffect(() => {
    if (activeRoute?.stops && activeRoute.stops.length > 0 && !destinationStop) {
      setDestinationStop(activeRoute.stops[activeRoute.stops.length - 1].name);
    }
  }, [activeRoute, destinationStop]);

  // Scroll active stop into view on the ribbon
  const handleScrollToActiveStop = () => {
    if (!ribbonScrollRef.current) return;
    const activeEl = ribbonScrollRef.current.querySelector(".active-bus-stop-node");
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  };

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
    <div className="space-y-3.5 sm:space-y-5 animate-fade-in pb-4">
      {/* 1. Mobile-Optimized Commuter Header */}
      <div className="p-3 sm:p-5 rounded-2xl border border-nexus-safe/40 bg-gradient-to-r from-bg-surface via-bg-elevated to-bg-surface shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-nexus-safe/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-nexus-safe/20 border border-nexus-safe/50 flex items-center justify-center text-nexus-safe shadow-glow-safe shrink-0">
              <Bus className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-nexus-safe/20 text-nexus-safe border border-nexus-safe/40 font-bold uppercase tracking-wider">
                  Live Commuter
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-tx-muted truncate">
                  Pass: {currentUser?.badgeOrId || "KNP-COMM-7702"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-tx-primary mt-0.5 font-mono truncate">
                {currentUser?.name || "Commuter"}
              </h2>
              <p className="text-[11px] sm:text-xs text-tx-secondary truncate">
                Riding: <span className="text-nexus-cyan font-bold font-mono">{activeBus.id} &bull; {activeRoute.code}</span>
              </p>
            </div>
          </div>

          {/* Quick Bus Selector Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1.5 p-1 px-2 rounded-xl bg-bg-surface/90 border border-border flex-1 sm:flex-initial">
              <span className="text-[9px] font-mono text-tx-muted uppercase font-bold shrink-0">Bus:</span>
              <select
                value={activeBusId}
                onChange={(e) => setActiveBusId(e.target.value)}
                className="bg-bg-elevated border border-border/80 text-nexus-cyan font-bold rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-nexus-cyan w-full sm:w-auto"
                title="Select active bus"
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
              className="py-1.5 px-2.5 rounded-xl bg-nexus-cyan/15 hover:bg-nexus-cyan/25 text-nexus-cyan border border-nexus-cyan/40 font-bold flex items-center gap-1 transition-all text-xs shrink-0"
              title="Switch to Operator Console"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Operator</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Mobile Thumb-Zone Quick Action Hub */}
      <div className="p-2.5 sm:p-3 rounded-2xl bg-bg-surface border border-nexus-cyan/30 shadow-xl space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-mono font-bold text-tx-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-nexus-cyan" />
            Passenger Quick Controls
          </span>
          <span className="text-[9px] font-mono text-nexus-safe font-semibold">
            1-TAP ACTIONS
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Action 1: Stop Bell */}
          <button
            onClick={handleRequestStop}
            disabled={stopRequested}
            className={`py-2.5 px-1.5 rounded-xl font-bold font-mono text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 ${
              stopRequested
                ? "bg-nexus-safe text-black shadow-glow-safe"
                : "bg-nexus-cyan hover:bg-nexus-cyan/90 text-black shadow-glow"
            }`}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-[11px] leading-tight text-center truncate w-full">
              {stopRequested ? "BELL RUNG" : "STOP BELL"}
            </span>
          </button>

          {/* Action 2: Show Ticket QR */}
          <button
            onClick={() => setShowQrModal(true)}
            className="py-2.5 px-1.5 rounded-xl bg-bg-elevated hover:bg-bg-hover text-tx-primary border border-border hover:border-nexus-cyan/40 font-bold font-mono text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md"
          >
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-nexus-cyan" />
            <span className="text-[10px] sm:text-[11px] leading-tight text-center truncate w-full">QR TICKET</span>
          </button>

          {/* Action 3: Share Ride */}
          <button
            onClick={handleShareRide}
            className="py-2.5 px-1.5 rounded-xl bg-bg-elevated hover:bg-bg-hover text-tx-primary border border-border hover:border-nexus-safe/40 font-bold font-mono text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-md"
          >
            {copiedShare ? (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-nexus-safe" />
                <span className="text-[10px] sm:text-[11px] text-nexus-safe leading-tight text-center truncate w-full">COPIED!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-nexus-safe" />
                <span className="text-[10px] sm:text-[11px] leading-tight text-center truncate w-full">SHARE ETA</span>
              </>
            )}
          </button>

          {/* Action 4: Passenger SOS */}
          <button
            onClick={() => {
              setSosConfirmed(true);
              setTimeout(() => setSosConfirmed(false), 5000);
            }}
            className={`py-2.5 px-1.5 rounded-xl font-bold font-mono text-xs flex flex-col items-center justify-center gap-1 transition-all shadow-md active:scale-95 ${
              sosConfirmed
                ? "bg-nexus-critical text-white shadow-glow-critical animate-pulse"
                : "bg-nexus-critical/15 hover:bg-nexus-critical/25 text-nexus-critical border border-nexus-critical/40"
            }`}
          >
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[10px] sm:text-[11px] leading-tight text-center truncate w-full">
              {sosConfirmed ? "SENT!" : "SOS"}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Real-Time Next Stop & Ride Telemetry HUD */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Next Stop Primary Card */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-nexus-safe/50 bg-gradient-to-br from-bg-surface to-bg-elevated shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-tx-muted">
            <span className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-nexus-safe">
              <span className="w-2 h-2 rounded-full bg-nexus-safe animate-pulse" />
              Next Stop
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
              schedule?.isDwellingAtStop ? "bg-nexus-warning/20 text-nexus-warning" : "bg-nexus-safe/20 text-nexus-safe"
            }`}>
              {schedule?.isDwellingAtStop ? "AT STATION" : "IN TRANSIT"}
            </span>
          </div>

          <div className="my-2">
            <div className="text-base sm:text-lg font-bold text-white font-mono truncate">
              {schedule?.nextStop || "Upcoming Stop"}
            </div>
            <div className="text-xs text-tx-secondary mt-1 flex items-baseline gap-2">
              <span>Arrival:</span>
              <span className="text-nexus-safe font-mono font-bold text-lg">
                ~{schedule?.etaNextStopMin || 2} min
              </span>
              <span className="text-tx-muted text-[11px] font-mono">(&plusmn;450m)</span>
            </div>
          </div>

          <div className="text-[10px] font-mono text-tx-muted border-t border-border/70 pt-2 flex items-center justify-between">
            <span className="truncate">From: {schedule?.currentOrPrevStop || "Terminal"}</span>
            <span className="text-nexus-cyan font-bold">{activeBus.speedKmh} km/h</span>
          </div>
        </div>

        {/* Bus & Driver Profile */}
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-tx-muted">
            <span className="uppercase text-[10px] text-nexus-cyan font-bold">Vehicle & Pilot</span>
            <span className="text-[10px] text-nexus-safe font-bold font-mono">e-Bus AC</span>
          </div>
          <div className="my-1.5">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-tx-primary font-mono">{activeBus.id}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bg-elevated border border-border text-tx-secondary">
                {activeBus.registration}
              </span>
            </div>
            <div className="text-xs text-tx-secondary mt-1 truncate">
              Pilot: <strong className="text-tx-primary">{activeBus.driverName}</strong>
              <span className="text-yellow-400 text-[11px] ml-1">&bull; 4.9 &starf;</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-tx-muted border-t border-border/70 pt-2 flex items-center justify-between">
            <span>Tata Ultra 9m</span>
            <span className="text-nexus-safe font-bold">Battery: {activeBus.batteryLevel || 84}%</span>
          </div>
        </div>

        {/* Trip Timings & Schedule Adherence */}
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-tx-muted">
            <span className="uppercase text-[10px] text-tx-muted font-bold">Trip Timetable</span>
            <span className="text-[10px] text-nexus-safe font-bold font-mono">
              ON TIME
            </span>
          </div>
          <div className="my-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[9px] text-tx-muted block">DEPARTED</span>
                <span className="text-xs sm:text-sm font-bold text-tx-primary">
                  {schedule?.currentTripDeparture || "09:30 AM"}
                </span>
              </div>
              <div className="text-center text-tx-muted">&rarr;</div>
              <div className="text-right">
                <span className="text-[9px] text-tx-muted block">EXP. DESTINATION</span>
                <span className="text-xs sm:text-sm font-bold text-nexus-cyan">
                  {schedule?.currentTripArrival || "10:25 AM"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-tx-muted border-t border-border/70 pt-2 flex items-center justify-between">
            <span>Interval: Every {schedule?.headwayMinutes || 15}m</span>
            <span className="text-tx-secondary truncate max-w-[120px]">
              End: {activeRoute.stops[activeRoute.stops.length - 1]?.name}
            </span>
          </div>
        </div>

        {/* Onboard Amenities & Speed */}
        <div className="p-3 sm:p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-tx-muted">
            <span className="uppercase text-[10px] text-tx-muted font-bold">Cabin Comfort</span>
            <span className="text-[10px] text-nexus-safe font-bold flex items-center gap-1">
              <Wifi className="w-3 h-3" /> 5G Wi-Fi
            </span>
          </div>
          <div className="my-1.5 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-tx-muted block">ROAD SPEED</span>
              <span className="text-base sm:text-lg font-bold text-tx-primary font-mono">
                {activeBus.speedKmh} <span className="text-xs font-normal text-tx-muted">km/h</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-tx-muted block">AC CLIMATE</span>
              <span className="text-base sm:text-lg font-bold text-nexus-cyan font-mono flex items-center justify-end gap-0.5">
                <Thermometer className="w-3.5 h-3.5" /> 21&deg;C
              </span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-tx-muted border-t border-border/70 pt-2 flex items-center justify-between">
            <span>Seats Free: ~16</span>
            <span className="text-nexus-safe">CCTV Active</span>
          </div>
        </div>
      </div>

      {/* 4. Live Single-Bus Road Track Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-nexus-safe animate-pulse shrink-0" />
            <span className="text-xs font-mono text-tx-secondary tracking-wider uppercase font-semibold truncate">
              Live Track &bull; Bus {activeBus.id} on {activeRoute.code}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMapExpanded(!isMapExpanded)}
              className="text-[10px] font-mono px-2 py-1 rounded-lg bg-bg-elevated border border-border text-nexus-cyan hover:text-white flex items-center gap-1 transition-colors"
              title={isMapExpanded ? "Compact Map" : "Expand Map"}
            >
              {isMapExpanded ? (
                <>
                  <Minimize2 className="w-3 h-3" />
                  <span>Compact</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3 h-3" />
                  <span>Expand</span>
                </>
              )}
            </button>
            <span className="text-[10px] font-mono text-nexus-cyan hidden sm:inline">
              GPS BEACON 3s
            </span>
          </div>
        </div>

        <FleetMap
          height={isMapExpanded ? "540px" : "330px"}
          singleBusId={activeBus.id}
          focusedRouteId={activeBus.routeId}
          passengerMode={true}
        />
      </div>

      {/* 5. Swipeable Stop-by-Stop Route Progress Ribbon */}
      <div className="p-3 sm:p-4 rounded-xl border border-border bg-bg-surface shadow-xl space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-nexus-cyan" />
            <span className="text-xs font-mono font-bold text-tx-primary uppercase tracking-wider">
              Route Stop Ribbon ({stopsList.length} Stops)
            </span>
          </div>

          <button
            onClick={handleScrollToActiveStop}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-bg-elevated border border-border text-nexus-cyan hover:underline flex items-center gap-1"
            title="Scroll horizontally to current bus location"
          >
            <LocateFixed className="w-3 h-3" />
            <span>Find My Bus</span>
          </button>
        </div>

        {/* Horizontal Touch-Friendly Stop Scroll Ribbon */}
        <div
          ref={ribbonScrollRef}
          className="overflow-x-auto pb-2 pt-1 scrollbar-thin scroll-smooth"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex items-center min-w-[700px] px-2">
            {stopsList.map((stop, idx) => {
              const isPast = currentStopIndex >= 0 && idx < currentStopIndex;
              const isCurrent =
                schedule?.currentOrPrevStop === stop.name ||
                (schedule?.nextStop === stop.name && !isPast);
              const isDestination = destinationStop === stop.name;

              return (
                <React.Fragment key={stop.name + idx}>
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

                  <div
                    onClick={() => setDestinationStop(stop.name)}
                    className={`flex flex-col items-center group cursor-pointer relative shrink-0 ${
                      isCurrent ? "active-bus-stop-node" : ""
                    }`}
                    title={`Tap to set ${stop.name} as drop-off destination`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all text-[10px] font-mono font-bold ${
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

                    <div className="mt-1 text-center max-w-[85px]">
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

      {/* 6. Mobile Tab Switcher for Tools (Phone Viewport Only) */}
      <div className="flex lg:hidden items-center p-1 rounded-xl bg-bg-surface border border-border gap-1 shadow-lg">
        <button
          onClick={() => setMobileTab("ALARM")}
          className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "ALARM"
              ? "bg-nexus-cyan text-black shadow-glow"
              : "text-tx-secondary hover:text-tx-primary"
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Alarm</span>
        </button>

        <button
          onClick={() => setMobileTab("TICKET")}
          className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "TICKET"
              ? "bg-nexus-cyan text-black shadow-glow"
              : "text-tx-secondary hover:text-tx-primary"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Pass</span>
        </button>

        <button
          onClick={() => setMobileTab("SAFETY")}
          className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "SAFETY"
              ? "bg-nexus-cyan text-black shadow-glow"
              : "text-tx-secondary hover:text-tx-primary"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Safety</span>
        </button>

        <button
          onClick={() => setMobileTab("INFO")}
          className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "INFO"
              ? "bg-nexus-cyan text-black shadow-glow"
              : "text-tx-secondary hover:text-tx-primary"
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Timetable</span>
        </button>
      </div>

      {/* 7. Passenger Interactive Options & Smart Travel Tools Grid */}
      {/* On desktop (lg+): Shows all cards in a 3-column grid. On mobile: shows the selected tab */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {/* Tool 1: Deboarding Stop Alarm */}
        <div
          className={`p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex-col justify-between space-y-3 ${
            mobileTab === "ALARM" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-tx-primary font-mono uppercase">
                  Deboarding Stop Alarm
                </h4>
                <p className="text-[11px] text-tx-muted">Sound chime 1 stop before drop-off</p>
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
              <label className="text-[10px] text-tx-muted block mb-1">MY DROP-OFF STATION:</label>
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
                <span>Alarm active: Chimes when approaching 1 stop prior.</span>
              </div>
            )}
          </div>
        </div>

        {/* Tool 2: Digital Transit Pass & QR Inspection */}
        <div
          className={`p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex-col justify-between space-y-3 ${
            mobileTab === "TICKET" ? "flex" : "hidden lg:flex"
          }`}
        >
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
            onClick={() => setShowQrModal(true)}
            className="w-full py-2.5 px-3 rounded-lg bg-nexus-cyan/15 hover:bg-nexus-cyan/25 text-nexus-cyan border border-nexus-cyan/40 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <QrCode className="w-4 h-4" />
            <span>Open Full-Screen QR Ticket</span>
          </button>
        </div>

        {/* Tool 3: Passenger Safety SOS & Helplines */}
        <div
          className={`p-4 rounded-xl border border-nexus-critical/30 bg-bg-surface shadow-xl flex-col justify-between space-y-3 ${
            mobileTab === "SAFETY" ? "flex" : "hidden lg:flex"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-nexus-critical/20 text-nexus-critical flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-tx-primary font-mono uppercase">
                  Safety & Emergency SOS
                </h4>
                <p className="text-[11px] text-tx-muted">Kanpur Transport Command</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-tx-secondary space-y-1.5 p-2 rounded-lg bg-bg-elevated/70 border border-border">
            <div className="flex justify-between items-center">
              <span>Police Emergency:</span>
              <a href="tel:112" className="text-white font-bold hover:underline flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-nexus-cyan" /> 112
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span>Women Powerline:</span>
              <a href="tel:1090" className="text-pink-400 font-bold hover:underline flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-pink-400" /> 1090
              </a>
            </div>
            <div className="flex justify-between items-center">
              <span>Transport Help:</span>
              <a href="tel:1073" className="text-nexus-cyan font-bold hover:underline flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-nexus-cyan" /> 1073
              </a>
            </div>
          </div>

          <button
            onClick={() => {
              setSosConfirmed(true);
              setTimeout(() => setSosConfirmed(false), 5000);
            }}
            className="w-full py-2.5 px-3 rounded-lg bg-nexus-critical/20 hover:bg-nexus-critical/30 text-nexus-critical border border-nexus-critical/50 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-glow-critical"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{sosConfirmed ? "ALERT SENT TO CONTROL ROOM" : "TRANSMIT EMERGENCY SOS"}</span>
          </button>
        </div>

        {/* Tool 4: Route Timetable Quick Info */}
        <div
          className={`p-4 rounded-xl border border-border bg-bg-surface shadow-xl flex-col justify-between space-y-3 ${
            mobileTab === "INFO" ? "flex" : "hidden lg:flex"
          }`}
        >
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
              <span className="text-tx-muted">Hours:</span>
              <span className="text-tx-primary font-bold">06:00 AM – 10:30 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tx-muted">Frequency:</span>
              <span className="text-nexus-safe font-bold">Every 15 mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tx-muted">Departures:</span>
              <span className="text-nexus-cyan font-bold">48 Trips Daily</span>
            </div>
          </div>

          <button
            onClick={() => (window.location.href = "/routes")}
            className="w-full py-2 px-3 rounded-lg bg-bg-elevated hover:bg-bg-hover text-tx-secondary hover:text-tx-primary border border-border text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>View Full Timetables</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 8. Full-Screen / Modal QR Ticket Experience (High Brightness for Conductor) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="p-5 rounded-2xl border border-nexus-cyan/50 bg-bg-surface shadow-2xl max-w-sm w-full space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-nexus-cyan" />
                <span className="font-bold font-mono text-xs sm:text-sm text-tx-primary">
                  KANPUR TRANSIT PASS
                </span>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-tx-muted hover:text-white text-sm w-7 h-7 rounded-lg flex items-center justify-center bg-bg-elevated"
              >
                &times;
              </button>
            </div>

            {/* High-Contrast White QR Graphic */}
            <div className="p-5 rounded-xl bg-white flex flex-col items-center justify-center text-black space-y-2 shadow-inner">
              <div className="w-44 h-44 border-4 border-black p-2 flex items-center justify-center">
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
                TAP OR SCAN FOR VALIDATION
              </span>
            </div>

            <div className="text-xs font-mono space-y-1.5 text-tx-secondary p-2.5 rounded-lg bg-bg-elevated border border-border">
              <div className="flex justify-between">
                <span>Passenger:</span>
                <strong className="text-white">{currentUser?.name || "Commuter"}</strong>
              </div>
              <div className="flex justify-between">
                <span>Pass ID:</span>
                <strong className="text-nexus-cyan font-bold">{currentUser?.badgeOrId || "KNP-COMM-7702"}</strong>
              </div>
              <div className="flex justify-between">
                <span>Bus Riding:</span>
                <strong className="text-white">{activeBus.id} ({activeBus.registration})</strong>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <strong className="text-nexus-safe font-bold">VALID &bull; AC CORRIDOR</strong>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-nexus-cyan text-black font-bold font-mono text-xs shadow-glow"
            >
              Close Pass Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PassengerJourneyView;
