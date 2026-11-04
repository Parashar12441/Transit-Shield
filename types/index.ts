export type Role = "ADMIN" | "DISPATCHER" | "OPERATOR" | "SUPERVISOR" | "DRIVER";

export interface Organization {
  id: string;
  name: string;
  code: string;
  region: string;
  status: "ACTIVE" | "INACTIVE";
  totalFleet: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId: string;
  avatarUrl?: string;
  badgeNumber?: string;
}

export type TrackingStatus = "LIVE" | "STALE" | "DISCONNECTED" | "INCIDENT";

export interface Vehicle {
  id: string;
  registrationNumber: string;
  model: string;
  capacity: number;
  assignedRouteId: string;
  assignedDriverId: string;
  status: "ACTIVE" | "MAINTENANCE" | "IDLE";
  lastMaintenanceDate: string;
  nextServiceDue: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  experienceYears: number;
  assignedVehicleId?: string;
  dutyStatus: "ON_DUTY" | "AVAILABLE" | "OFF_DUTY";
  deviceStatus: "ONLINE" | "STALE" | "OFFLINE";
  appVersion: string;
  lastHeartbeat: number;
  rating: number;
}

export interface RouteStop {
  id: string;
  sequence: number;
  name: string;
  lat: number;
  lng: number;
  expectedDwellSec: number;
}

export interface StopTiming {
  stopId: string;
  sequence: number;
  stopName: string;
  offsetMinutes: number;
  expectedDwellSec: number;
  lat: number;
  lng: number;
}

export interface RouteSchedule {
  routeId: string;
  routeCode: string;
  routeName: string;
  operatingHours: {
    firstBus: string;
    lastBus: string;
  };
  peakFrequencyMin: number;
  offPeakFrequencyMin: number;
  tripDurationMin: number;
  totalDistanceKm: number;
  sources: {
    title: string;
    publisher: string;
    verificationNotes: string;
    url?: string;
  }[];
  stops: StopTiming[];
  dailyDepartures: string[];
}

export interface Route {
  id: string;
  code: string;
  name: string;
  color: string;
  speedLimitKmh: number;
  deviationCorridorMeters: number;
  deviationPersistenceSec: number;
  unplannedStopThresholdMin: number;
  stops: RouteStop[];
  waypoints: [number, number][];
}

export interface BusScheduleStatus {
  currentTripDeparture: string;
  currentTripArrival: string;
  currentOrPrevStop: string;
  nextStop: string;
  etaNextStopMin: number;
  scheduleAdherence: "ON_TIME" | "SLIGHT_DELAY" | "AT_STOP" | "TERMINAL_STANDBY";
  delayMinutes: number;
  isDwellingAtStop: boolean;
  dwellingStopName?: string;
  headwayMinutes: number;
  sourceAttribution: string;
}

export interface BusTelemetry {
  id: string;
  registration: string;
  driverName: string;
  driverId: string;
  routeId: string;
  routeName: string;
  lat: number;
  lng: number;
  speedKmh: number;
  headingDeg: number;
  gpsAccuracyMeters: number;
  lastSeenMs: number;
  trackingStatus: TrackingStatus;
  progressFraction?: number;
  progressPercent: number;
  direction: 1 | -1;
  activeIncidentId?: string;
  telemetrySource: "ANDROID_FOREGROUND_GPS" | "AIS_140_HARDWARE" | "SIMULATION" | "CHALO_LIVE_FEED" | "GTFS_REALTIME" | "SCHEDULED_TIMETABLE";
  scheduleStatus?: BusScheduleStatus;
  batteryLevel?: number;
}

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentStatus =
  | "NEW"
  | "ACKNOWLEDGED"
  | "RESPONDING"
  | "RESOLVED"
  | "CLOSED";

export type IncidentType =
  | "DRIVER_SOS"
  | "ROUTE_DEVIATION"
  | "OVERSPEED_WARNING"
  | "UNEXPECTED_STOP"
  | "GPS_SIGNAL_LOSS"
  | "SUSPECTED_COLLISION"
  | "HARSH_BRAKING";

export interface IncidentEvent {
  id: string;
  timestamp: number;
  actor: string;
  actorRole?: string;
  description: string;
  eventType: "CREATED" | "ACKNOWLEDGED" | "ASSIGNED" | "ESCALATED" | "STATUS_CHANGE" | "NOTE" | "RESOLVED" | "CLOSED";
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  busId: string;
  busReg: string;
  driverName: string;
  routeId: string;
  routeName: string;
  triggeredAt: number;
  acknowledgedAt?: number;
  resolvedAt?: number;
  closedAt?: number;
  lat: number;
  lng: number;
  speedAtIncidentKmh: number;
  assignedOperator: string;
  origin: "MANUAL_SOS" | "SAFETY_RULE_ENGINE" | "ANOMALY_DETECTOR";
  ruleTriggerDetails?: string;
  events: IncidentEvent[];
  notesCount: number;
}

export interface NotificationItem {
  id: string;
  incidentId: string;
  title: string;
  message: string;
  severity: IncidentSeverity;
  timestamp: number;
  read: boolean;
  busId: string;
}

export interface Geofence {
  id: string;
  name: string;
  type: "DEPOT" | "RESTRICTED_ZONE" | "TERMINAL" | "HIGH_RISK_CORRIDOR";
  radiusMeters: number;
  center: [number, number];
  alertOn: "ENTRY" | "EXIT" | "BOTH";
}

export interface HistoricalTrip {
  id: string;
  busId: string;
  busReg: string;
  driverName: string;
  routeId: string;
  routeName: string;
  startTime: number;
  endTime: number;
  durationMin: number;
  distanceKm: number;
  maxSpeedKmh: number;
  avgSpeedKmh: number;
  stopsCompleted: number;
  totalStops: number;
  incidents: string[];
  hasGpsGaps: boolean;
  coordinates: [number, number][];
}
