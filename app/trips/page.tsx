"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { MOCK_TRIPS } from "@/lib/mock-data/trips";
import { formatTimeIST, formatDateIST } from "@/lib/utils";
import {
  History,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Clock,
  Compass,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Calendar,
} from "lucide-react";

const TripReplayMap = dynamic(
  () => import("@/components/trips/TripReplayMap").then((m) => m.TripReplayMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] w-full rounded-xl border border-border bg-bg-surface flex items-center justify-center text-xs text-tx-muted font-mono animate-pulse">
        RECONSTRUCTING HISTORICAL TELEMETRY PATH...
      </div>
    ),
  }
);

export default function TripHistoryPage() {
  const [selectedTripId, setSelectedTripId] = useState<string>(MOCK_TRIPS[0].id);
  const [search, setSearch] = useState<string>("");
  const [pointIndex, setPointIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const selectedTrip =
    MOCK_TRIPS.find((t) => t.id === selectedTripId) || MOCK_TRIPS[0];

  const totalPoints = selectedTrip.coordinates.length;

  // Playback timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setPointIndex((prev) => {
          if (prev >= totalPoints - 1) {
            setIsPlaying(false);
            return totalPoints - 1;
          }
          return prev + 1;
        });
      }, 300 / playbackSpeed);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed, totalPoints]);

  const handleTripSelect = (id: string) => {
    setSelectedTripId(id);
    setPointIndex(0);
    setIsPlaying(false);
  };

  const progressPercent = Math.round((pointIndex / (totalPoints - 1)) * 100);

  // Approximate current time based on progress
  const currentReplayTime =
    selectedTrip.startTime +
    (selectedTrip.endTime - selectedTrip.startTime) * (pointIndex / (totalPoints - 1));

  const filteredTrips = MOCK_TRIPS.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.id.toLowerCase().includes(q) ||
        t.busId.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q) ||
        t.routeName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Top Banner */}
      <div className="p-4 rounded-xl border border-border bg-bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-nexus-cyan" />
            <h2 className="text-base font-bold text-tx-primary font-mono tracking-wide">
              HISTORICAL TRIP INVESTIGATION &bull; JOURNEY REPLAY
            </h2>
          </div>
          <p className="text-xs text-tx-secondary mt-0.5">
            Audit journey trajectories, safety speed logs, GPS connectivity gaps, and stop dwell events.
          </p>
        </div>

        <div className="text-xs font-mono text-tx-muted flex items-center gap-2">
          <Calendar className="w-4 h-4 text-nexus-cyan" />
          <span>REPLAY DATE: {formatDateIST(selectedTrip.startTime)}</span>
        </div>
      </div>

      {/* Main Grid: Replay Controls & Map (Left 8 cols) + Trip List & Milestones (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Interactive Map & Replay Player Controls */}
        <div className="lg:col-span-8 space-y-3">
          <TripReplayMap trip={selectedTrip} currentPointIndex={pointIndex} />

          {/* Player Controls Bar */}
          <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-xl">
            {/* Scrubber slider */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-nexus-cyan font-bold">
                  {formatTimeIST(currentReplayTime)}
                </span>
                <span className="text-tx-secondary">
                  Step {pointIndex + 1} of {totalPoints} ({progressPercent}%)
                </span>
                <span className="text-tx-muted">
                  End: {formatTimeIST(selectedTrip.endTime)}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={totalPoints - 1}
                value={pointIndex}
                onChange={(e) => setPointIndex(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Buttons & Speed controls */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2 rounded-lg bg-nexus-cyan text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-glow hover:bg-cyan-300 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? "Pause" : "Play Replay"}</span>
                </button>

                <button
                  onClick={() => {
                    setPointIndex(0);
                    setIsPlaying(false);
                  }}
                  className="p-2 rounded-lg bg-bg-elevated hover:bg-bg-hover text-tx-secondary hover:text-tx-primary border border-border transition-colors"
                  title="Rewind to start"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed selector */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-[11px] text-tx-muted mr-1">SPEED:</span>
                {[1, 2, 4].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                      playbackSpeed === spd
                        ? "bg-nexus-cyan/20 text-nexus-cyan border border-nexus-cyan/50 font-bold"
                        : "bg-bg-elevated text-tx-muted border border-border hover:text-tx-primary"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Searchable Trips List & Timeline Milestones */}
        <div className="lg:col-span-4 space-y-4">
          {/* Trip Selection List */}
          <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-nexus-cyan" />
              Completed Journey Logs ({MOCK_TRIPS.length})
            </h3>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredTrips.map((trip) => {
                const isSelected = trip.id === selectedTrip.id;

                return (
                  <div
                    key={trip.id}
                    onClick={() => handleTripSelect(trip.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-nexus-cyan/15 border-nexus-cyan shadow-glow"
                        : "bg-bg-elevated/70 border-border hover:border-border-bright"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-tx-primary">
                        {trip.busId} &bull; {trip.id}
                      </span>
                      <span className="text-[10px] text-tx-muted font-mono">
                        {trip.durationMin}m &bull; {trip.distanceKm}km
                      </span>
                    </div>

                    <div className="text-[11px] text-tx-secondary font-sans truncate">
                      {trip.driverName} &bull; {trip.routeName}
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/40 text-[10px] font-mono">
                      <span className="text-tx-muted">
                        {formatTimeIST(trip.startTime)} - {formatTimeIST(trip.endTime)}
                      </span>
                      {trip.incidents.length > 0 && (
                        <span className="text-nexus-critical font-bold">
                          {trip.incidents.length} ALERT
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Journey Milestones Audit */}
          <div className="p-4 rounded-xl border border-border bg-bg-surface space-y-3 shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-tx-secondary font-mono flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-nexus-cyan" />
              Trip Audit Timeline &bull; {selectedTrip.id}
            </h3>

            <div className="space-y-2 text-xs font-sans">
              <div className="p-2 rounded bg-bg-elevated border border-border flex items-center justify-between">
                <span className="text-tx-muted">Trip Departure</span>
                <span className="font-mono font-bold text-nexus-safe">
                  {formatTimeIST(selectedTrip.startTime)}
                </span>
              </div>

              <div className="p-2 rounded bg-bg-elevated border border-border flex items-center justify-between">
                <span className="text-tx-muted">Stops Reached</span>
                <span className="font-mono font-bold text-tx-primary">
                  {selectedTrip.stopsCompleted} / {selectedTrip.totalStops} Stops
                </span>
              </div>

              <div className="p-2 rounded bg-bg-elevated border border-border flex items-center justify-between">
                <span className="text-tx-muted">Peak Speed Recorded</span>
                <span className="font-mono font-bold text-tx-primary">
                  {selectedTrip.maxSpeedKmh} km/h
                </span>
              </div>

              <div className="p-2 rounded bg-bg-elevated border border-border flex items-center justify-between">
                <span className="text-tx-muted">Average Corridor Speed</span>
                <span className="font-mono font-bold text-tx-primary">
                  {selectedTrip.avgSpeedKmh} km/h
                </span>
              </div>

              <div className="p-2 rounded bg-bg-elevated border border-border flex items-center justify-between">
                <span className="text-tx-muted">Telemetry Integrity</span>
                <span
                  className={`font-mono font-bold ${
                    selectedTrip.hasGpsGaps ? "text-nexus-warning" : "text-nexus-safe"
                  }`}
                >
                  {selectedTrip.hasGpsGaps ? "GPS Gaps Detected" : "100% Signal Integrity"}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-tx-muted font-mono pt-1">
              ESTIMATED PATH RECONSTRUCTED FROM CELLULAR TELEMETRY PACKETS.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
