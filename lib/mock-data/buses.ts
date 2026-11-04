import { BusTelemetry, Driver, Vehicle } from "@/types";
import { MOCK_ROUTES } from "./routes";
import { calculateBusScheduleState } from "./schedules";

export const MOCK_DRIVERS: Driver[] = [
  { id: "DRV-01", name: "Ramesh Verma", phone: "+91 98390 12345", licenseNumber: "UP78 2014002341", experienceYears: 12, dutyStatus: "ON_DUTY", deviceStatus: "ONLINE", appVersion: "v2.4.1", lastHeartbeat: Date.now() - 4000, rating: 4.8 },
  { id: "DRV-02", name: "Suresh Yadav", phone: "+91 94150 98765", licenseNumber: "UP78 2016008742", experienceYears: 9, dutyStatus: "ON_DUTY", deviceStatus: "ONLINE", appVersion: "v2.4.1", lastHeartbeat: Date.now() - 6000, rating: 4.7 },
  { id: "DRV-03", name: "Arif Khan", phone: "+91 91250 44556", licenseNumber: "UP78 2011003419", experienceYears: 15, dutyStatus: "ON_DUTY", deviceStatus: "ONLINE", appVersion: "v2.4.0", lastHeartbeat: Date.now() - 2000, rating: 4.9 },
  { id: "DRV-04", name: "Manoj Singh", phone: "+91 98890 22334", licenseNumber: "UP78 2018009123", experienceYears: 6, dutyStatus: "ON_DUTY", deviceStatus: "ONLINE", appVersion: "v2.4.1", lastHeartbeat: Date.now() - 8000, rating: 4.5 },
  { id: "DRV-05", name: "Pankaj Mishra", phone: "+91 93350 77889", licenseNumber: "UP78 2015004567", experienceYears: 10, dutyStatus: "ON_DUTY", deviceStatus: "STALE", appVersion: "v2.3.8", lastHeartbeat: Date.now() - 140000, rating: 4.2 },
  { id: "DRV-06", name: "Kuldeep Dubey", phone: "+91 97930 11223", licenseNumber: "UP78 2017007890", experienceYears: 8, dutyStatus: "ON_DUTY", deviceStatus: "ONLINE", appVersion: "v2.4.1", lastHeartbeat: Date.now() - 5000, rating: 4.6 },
  { id: "DRV-07", name: "Vikas Gupta", phone: "+91 94520 66778", licenseNumber: "UP78 2013005671", experienceYears: 11, dutyStatus: "ON_DUTY", deviceStatus: "ONLINE", appVersion: "v2.4.1", lastHeartbeat: Date.now() - 3000, rating: 4.8 },
  { id: "DRV-08", name: "Deepak Tiwari", phone: "+91 98380 99001", licenseNumber: "UP78 2019003214", experienceYears: 5, dutyStatus: "ON_DUTY", deviceStatus: "ONLINE", appVersion: "v2.4.1", lastHeartbeat: Date.now() - 7000, rating: 4.4 },
  { id: "DRV-09", name: "Nitin Sharma", phone: "+91 91400 33445", licenseNumber: "UP78 2016001298", experienceYears: 8, dutyStatus: "ON_DUTY", deviceStatus: "STALE", appVersion: "v2.4.0", lastHeartbeat: Date.now() - 195000, rating: 4.3 },
  { id: "DRV-10", name: "Haider Ali", phone: "+91 94151 55667", licenseNumber: "UP78 2012008765", experienceYears: 13, dutyStatus: "ON_DUTY", deviceStatus: "ONLINE", appVersion: "v2.4.1", lastHeartbeat: Date.now() - 4000, rating: 4.9 },
  { id: "DRV-11", name: "Tarun Pal", phone: "+91 98399 77881", licenseNumber: "UP78 2018006543", experienceYears: 6, dutyStatus: "ON_DUTY", deviceStatus: "ONLINE", appVersion: "v2.4.1", lastHeartbeat: Date.now() - 5000, rating: 4.6 },
  { id: "DRV-12", name: "Jagdish Rao", phone: "+91 93360 88992", licenseNumber: "UP78 2010009871", experienceYears: 16, dutyStatus: "ON_DUTY", deviceStatus: "ONLINE", appVersion: "v2.4.1", lastHeartbeat: Date.now() - 2000, rating: 4.7 },
  { id: "DRV-13", name: "Dinesh Joshi", phone: "+91 94500 12987", licenseNumber: "UP78 2017004321", experienceYears: 7, dutyStatus: "AVAILABLE", deviceStatus: "OFFLINE", appVersion: "v2.4.1", lastHeartbeat: Date.now() - 980000, rating: 4.5 },
  { id: "DRV-14", name: "Lalit Chandra", phone: "+91 98899 44332", licenseNumber: "UP78 2015006789", experienceYears: 9, dutyStatus: "AVAILABLE", deviceStatus: "OFFLINE", appVersion: "v2.4.1", lastHeartbeat: Date.now() - 1200000, rating: 4.6 },
];

export const MOCK_VEHICLES: Vehicle[] = MOCK_DRIVERS.slice(0, 12).map((d, i) => ({
  id: `KNP-${101 + i}`,
  registrationNumber: `UP78 AT ${4100 + i * 37}`,
  model: i % 2 === 0 ? "Tata Ultra EV 9m" : "Ashok Leyland Falcon AC",
  capacity: i % 2 === 0 ? 34 : 42,
  assignedRouteId: MOCK_ROUTES[i % MOCK_ROUTES.length].id,
  assignedDriverId: d.id,
  status: i === 11 ? "MAINTENANCE" : "ACTIVE",
  lastMaintenanceDate: "2026-09-15",
  nextServiceDue: i === 11 ? "Overdue" : "2026-11-20",
}));

// Calculate surface distance between two lat/lng coordinates in meters (Haversine formula)
export function getDistanceMeters(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number]
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Compute high-fidelity road position and road bearing along route waypoints using physical road distance
export function getRouteSegmentAtProgress(
  waypoints: [number, number][],
  t: number
): {
  point: [number, number];
  bearing: number;
} {
  const count = waypoints.length;
  if (count === 0) return { point: [26.465, 80.31], bearing: 0 };
  if (count === 1) return { point: waypoints[0], bearing: 0 };

  const clampedT = Math.max(0, Math.min(1, t));

  // Compute cumulative road distances across all segments
  const cumulativeDistances: number[] = [0];
  let totalDistance = 0;
  for (let i = 0; i < count - 1; i++) {
    const dist = getDistanceMeters(waypoints[i], waypoints[i + 1]);
    totalDistance += dist;
    cumulativeDistances.push(totalDistance);
  }

  if (totalDistance === 0) {
    return { point: waypoints[0], bearing: 0 };
  }

  const targetDist = clampedT * totalDistance;

  // Locate the exact road segment containing the target physical distance
  let segIdx = 0;
  for (let i = 0; i < count - 1; i++) {
    if (targetDist >= cumulativeDistances[i] && targetDist <= cumulativeDistances[i + 1]) {
      segIdx = i;
      break;
    }
    if (i === count - 2) {
      segIdx = i;
    }
  }

  const segStartDist = cumulativeDistances[segIdx];
  const segEndDist = cumulativeDistances[segIdx + 1];
  const segLength = segEndDist - segStartDist;

  const frac = segLength > 0 ? (targetDist - segStartDist) / segLength : 0;

  const [lat1, lng1] = waypoints[segIdx];
  const [lat2, lng2] = waypoints[segIdx + 1];

  // Precise coordinate on the road centerline
  const point: [number, number] = [
    lat1 + (lat2 - lat1) * frac,
    lng1 + (lng2 - lng1) * frac,
  ];

  // Exact forward road bearing along this specific asphalt segment
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;

  const y = Math.sin(dLng) * Math.cos(rLat2);
  const x =
    Math.cos(rLat1) * Math.sin(rLat2) -
    Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  return { point, bearing: Math.round(bearing) };
}

// Helper to compute coordinate along route waypoints given progress t in [0, 1]
export function getRoutePosition(waypoints: [number, number][], t: number): [number, number] {
  return getRouteSegmentAtProgress(waypoints, t).point;
}

// Compute exact bearing along the route line so the bus icon is perfectly aligned to the road
export function getRouteBearing(
  waypoints: [number, number][],
  t: number,
  direction: 1 | -1 = 1
): number {
  const { bearing } = getRouteSegmentAtProgress(waypoints, t);
  if (direction === -1) {
    return (bearing + 180) % 360;
  }
  return bearing;
}

export function createInitialBuses(): BusTelemetry[] {
  const now = Date.now();
  return MOCK_DRIVERS.slice(0, 12).map((drv, i) => {
    const routeIndex = i % MOCK_ROUTES.length;
    const busIndexOnRoute = Math.floor(i / MOCK_ROUTES.length); // 0 (Bus A) or 1 (Bus B)
    const route = MOCK_ROUTES[routeIndex];

    // Compute real position directly from the published route timetable
    const sched = calculateBusScheduleState(route, busIndexOnRoute, now);
    const isStale = i === 4 || i === 8;

    return {
      id: `KNP-${101 + i}`,
      registration: `UP78 AT ${4100 + i * 37}`,
      driverName: drv.name,
      driverId: drv.id,
      routeId: route.id,
      routeName: route.name,
      lat: sched.position[0],
      lng: sched.position[1],
      speedKmh: isStale ? 0 : sched.speedKmh,
      headingDeg: sched.headingDeg,
      gpsAccuracyMeters: 6.5 + (i % 4),
      lastSeenMs: isStale ? now - (120000 + i * 15000) : now - (3000 + i * 800),
      trackingStatus: isStale ? "STALE" : "LIVE",
      progressFraction: sched.progressFraction,
      progressPercent: Math.round(sched.progressFraction * 100),
      direction: sched.direction,
      telemetrySource: "SCHEDULED_TIMETABLE",
      scheduleStatus: sched.scheduleStatus,
    };
  });
}
