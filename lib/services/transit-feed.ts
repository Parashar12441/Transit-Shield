import { BusTelemetry, TrackingStatus } from "@/types";

export interface ChaloBusPacket {
  vehicleId?: string;
  busId?: string;
  registration?: string;
  routeNumber?: string;
  routeId?: string;
  routeName?: string;
  lat: number;
  lng: number;
  speed?: number;
  speedKmh?: number;
  bearing?: number;
  headingDeg?: number;
  accuracy?: number;
  timestamp?: number;
  occupancy?: "SEATS_AVAILABLE" | "STANDING_ONLY" | "FULL" | string;
  isAirConditioned?: boolean;
  driverName?: string;
  emergencyState?: boolean;
}

export interface Ais140Packet {
  imei?: string;
  vehicleNumber: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  heading: number;
  timestamp: number;
  ignition: boolean;
  emergencyState: boolean;
  batteryPercent?: number;
  gsmSignal?: number;
}

export interface TelematicsIngestResponse {
  success: boolean;
  receivedCount: number;
  ingestedBuses: BusTelemetry[];
  timestamp: number;
  source: string;
}

// In-memory store of external live telemetry packets received
const liveIngestedStore: Map<string, BusTelemetry> = new Map();
let totalPacketsReceived = 0;
let lastPacketTimestamp = 0;

/**
 * Normalizes Chalo or city transit JSON into standard BusTelemetry model
 */
export function normalizeChaloBus(packet: ChaloBusPacket, index = 0): BusTelemetry {
  const id = (packet.vehicleId || packet.busId || `LIVE-CHALO-${index + 1}`).trim();
  const registration = (packet.registration || `UP-78-CH-${1000 + (index * 7)}`).trim();
  const routeId = packet.routeId || (packet.routeNumber ? `ROUTE-${packet.routeNumber}` : "ROUTE-101");
  const routeName = packet.routeName || (packet.routeNumber ? `Route ${packet.routeNumber}` : "Kanpur Central Line");
  const lat = Number(packet.lat);
  const lng = Number(packet.lng);
  const speedKmh = Math.round(Number(packet.speedKmh ?? packet.speed ?? 28));
  const headingDeg = Math.round(Number(packet.headingDeg ?? packet.bearing ?? 90));
  const timestamp = Number(packet.timestamp || Date.now());

  const trackingStatus: TrackingStatus = packet.emergencyState ? "INCIDENT" : "LIVE";

  return {
    id,
    registration,
    driverName: packet.driverName || "Chalo Local Fleet Operator",
    driverId: `DRV-${id}`,
    routeId,
    routeName,
    lat,
    lng,
    speedKmh,
    headingDeg,
    gpsAccuracyMeters: Number(packet.accuracy || 3.5),
    lastSeenMs: timestamp,
    trackingStatus,
    progressPercent: 50,
    direction: 1,
    telemetrySource: "CHALO_LIVE_FEED",
  };
}

/**
 * Normalizes Indian Standard AIS-140 GPS telematics packets
 */
export function normalizeAis140(packet: Ais140Packet): BusTelemetry {
  const id = packet.vehicleNumber.replace(/[^a-zA-Z0-9]/g, "-").toUpperCase();
  return {
    id,
    registration: packet.vehicleNumber,
    driverName: "Certified AIS-140 Fleet Driver",
    driverId: `DRV-AIS-${id}`,
    routeId: "ROUTE-101",
    routeName: "AIS-140 Statutory Transit Corridor",
    lat: packet.latitude,
    lng: packet.longitude,
    speedKmh: Math.round(packet.speedKmh),
    headingDeg: Math.round(packet.heading),
    gpsAccuracyMeters: 2.5,
    lastSeenMs: packet.timestamp || Date.now(),
    trackingStatus: packet.emergencyState ? "INCIDENT" : "LIVE",
    progressPercent: 50,
    direction: 1,
    telemetrySource: "AIS_140_HARDWARE",
  };
}

/**
 * Record ingested buses into server-side cache
 */
export function ingestBuses(buses: BusTelemetry[]): void {
  totalPacketsReceived += buses.length;
  lastPacketTimestamp = Date.now();
  for (const bus of buses) {
    liveIngestedStore.set(bus.id, bus);
  }
}

/**
 * Retrieve all currently cached live ingested buses
 */
export function getLiveIngestedBuses(): BusTelemetry[] {
  return Array.from(liveIngestedStore.values());
}

/**
 * Get ingestion telemetry metrics
 */
export function getIngestStats() {
  return {
    totalPacketsReceived,
    lastPacketTimestamp,
    activeLiveVehiclesCount: liveIngestedStore.size,
    isListening: true,
  };
}
