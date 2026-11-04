/**
 * NEXUS TRANSIT - CHALO APP & LIVE LOCAL BUS TELEMATICS STREAMER
 * 
 * This script demonstrates how real-world Indian local bus data (Chalo format,
 * municipal GTFS-RT feeds, or AIS-140 on-board GPS trackers) is streamed
 * continuously into the NEXUS Transit Command Center.
 * 
 * Usage:
 *   node scripts/chalo-live-streamer.js
 * 
 * Options:
 *   TARGET_URL=http://localhost:3000/api/telematics/ingest node scripts/chalo-live-streamer.js
 */

const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000/api/telematics/ingest";
const INTERVAL_MS = 2500;

// Realistic Indian Local Buses operating on Kanpur corridors
const LIVE_LOCAL_BUSES = [
  {
    vehicleId: "KNP-CHALO-101",
    registration: "UP-78-CH-4921",
    routeNumber: "101",
    routeName: "Kanpur Central - Rawatpur - IIT Kanpur",
    driverName: "Sanjay Kumar",
    lat: 26.4715,
    lng: 80.3245,
    speedKmh: 34,
    headingDeg: 115,
    occupancy: "SEATS_AVAILABLE",
    direction: 1,
  },
  {
    vehicleId: "KNP-CHALO-102",
    registration: "UP-78-CH-5510",
    routeNumber: "102",
    routeName: "Kalyanpur - Mall Road - Cantt",
    driverName: "Deepak Verma",
    lat: 26.4950,
    lng: 80.2650,
    speedKmh: 42,
    headingDeg: 285,
    occupancy: "STANDING_ONLY",
    direction: -1,
  },
  {
    vehicleId: "KNP-CHALO-103",
    registration: "UP-78-CH-7820",
    routeNumber: "103",
    routeName: "Barra Bypass - Govind Nagar Ring Line",
    driverName: "Rajesh Yadav",
    lat: 26.4420,
    lng: 80.3120,
    speedKmh: 28,
    headingDeg: 45,
    occupancy: "FULL",
    direction: 1,
  },
];

console.log("==================================================================");
console.log("🚀 NEXUS TRANSIT — CHALO APP LIVE BUS TELEMATICS FEEDER");
console.log(`📡 Ingestion Gateway Endpoint: ${TARGET_URL}`);
console.log(`⏱  Streaming Frequency: every ${INTERVAL_MS / 1000}s`);
console.log("==================================================================\n");

async function streamLiveTelematics() {
  // Simulate continuous real-world GPS delta along the road
  LIVE_LOCAL_BUSES.forEach((bus) => {
    const latDelta = (Math.random() - 0.48) * 0.0006;
    const lngDelta = (Math.random() - 0.48) * 0.0006;
    bus.lat = Number((bus.lat + latDelta).toFixed(6));
    bus.lng = Number((bus.lng + lngDelta).toFixed(6));
    bus.speedKmh = Math.max(15, Math.min(50, Math.round(bus.speedKmh + (Math.random() * 4 - 2))));
    bus.headingDeg = (bus.headingDeg + Math.round(Math.random() * 6 - 3) + 360) % 360;
  });

  const payload = {
    source: "CHALO_LIVE_FEED",
    city: "Kanpur",
    timestamp: Date.now(),
    buses: LIVE_LOCAL_BUSES.map((b) => ({
      vehicleId: b.vehicleId,
      registration: b.registration,
      routeNumber: b.routeNumber,
      routeName: b.routeName,
      driverName: b.driverName,
      lat: b.lat,
      lng: b.lng,
      speedKmh: b.speedKmh,
      headingDeg: b.headingDeg,
      occupancy: b.occupancy,
      timestamp: Date.now(),
    })),
  };

  try {
    const res = await fetch(TARGET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      const timeStr = new Date().toLocaleTimeString();
      console.log(`[${timeStr}] ✓ Pushed ${data.receivedCount} live bus coordinates to Command Center.`);
      LIVE_LOCAL_BUSES.forEach((b) => {
        console.log(`   └─ ${b.registration} (${b.routeNumber}): ${b.lat}, ${b.lng} @ ${b.speedKmh} km/h (${b.occupancy})`);
      });
    } else {
      console.error(`[ERR] HTTP ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error(`[ERR] Failed to reach ${TARGET_URL}:`, err.message);
  }
}

// Initial push and continuous interval
streamLiveTelematics();
setInterval(streamLiveTelematics, INTERVAL_MS);
