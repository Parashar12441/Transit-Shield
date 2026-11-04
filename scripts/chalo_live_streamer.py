"""
NEXUS TRANSIT — CHALO APP & LIVE LOCAL BUS TELEMATICS STREAMER (PYTHON)

Simulates or feeds real-time bus GPS coordinates into the NEXUS Transit Command Center.
Can be hooked up to:
  - Phone GPS tracking via companion app
  - Local AIS-140 GPS tracker TCP/HTTP stream
  - City Open Data / GTFS-Realtime vehicle position feeds

Usage:
  python scripts/chalo_live_streamer.py
"""

import time
import random
import json
import urllib.request
import urllib.error

TARGET_URL = "http://localhost:3000/api/telematics/ingest"
INTERVAL_SECONDS = 3.0

LIVE_LOCAL_BUSES = [
    {
        "vehicleId": "KNP-CHALO-101",
        "registration": "UP-78-CH-4921",
        "routeNumber": "101",
        "routeName": "Kanpur Central - Rawatpur - IIT Kanpur",
        "driverName": "Sanjay Kumar",
        "lat": 26.4715,
        "lng": 80.3245,
        "speedKmh": 34,
        "headingDeg": 115,
        "occupancy": "SEATS_AVAILABLE",
    },
    {
        "vehicleId": "KNP-CHALO-102",
        "registration": "UP-78-CH-5510",
        "routeNumber": "102",
        "routeName": "Kalyanpur - Mall Road - Cantt",
        "driverName": "Deepak Verma",
        "lat": 26.4950,
        "lng": 80.2650,
        "speedKmh": 42,
        "headingDeg": 285,
        "occupancy": "STANDING_ONLY",
    },
    {
        "vehicleId": "KNP-CHALO-103",
        "registration": "UP-78-CH-7820",
        "routeNumber": "103",
        "routeName": "Barra Bypass - Govind Nagar Ring Line",
        "driverName": "Rajesh Yadav",
        "lat": 26.4420,
        "lng": 80.3120,
        "speedKmh": 28,
        "headingDeg": 45,
        "occupancy": "FULL",
    },
]

def stream_telematics():
    print("=" * 66)
    print("🚀 NEXUS TRANSIT — CHALO APP LIVE BUS TELEMATICS STREAMER")
    print(f"📡 Gateway Endpoint: {TARGET_URL}")
    print(f"⏱  Frequency: every {INTERVAL_SECONDS}s")
    print("=" * 66 + "\n")

    while True:
        # Update coordinates along path with realistic delta
        for bus in LIVE_LOCAL_BUSES:
            lat_delta = (random.random() - 0.48) * 0.0006
            lng_delta = (random.random() - 0.48) * 0.0006
            bus["lat"] = round(bus["lat"] + lat_delta, 6)
            bus["lng"] = round(bus["lng"] + lng_delta, 6)
            bus["speedKmh"] = max(15, min(50, round(bus["speedKmh"] + random.uniform(-2, 2))))
            bus["headingDeg"] = int((bus["headingDeg"] + random.randint(-4, 4)) % 360)

        payload = {
            "source": "CHALO_LIVE_FEED",
            "city": "Kanpur",
            "timestamp": int(time.time() * 1000),
            "buses": [
                {
                    "vehicleId": b["vehicleId"],
                    "registration": b["registration"],
                    "routeNumber": b["routeNumber"],
                    "routeName": b["routeName"],
                    "driverName": b["driverName"],
                    "lat": b["lat"],
                    "lng": b["lng"],
                    "speedKmh": b["speedKmh"],
                    "headingDeg": b["headingDeg"],
                    "occupancy": b["occupancy"],
                    "timestamp": int(time.time() * 1000),
                }
                for b in LIVE_LOCAL_BUSES
            ],
        }

        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            TARGET_URL,
            data=data_bytes,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode("utf-8"))
                time_str = time.strftime("%H:%M:%S")
                print(f"[{time_str}] ✓ Pushed {result.get('receivedCount', 0)} live buses to Command Center.")
                for b in LIVE_LOCAL_BUSES:
                    print(f"   └─ {b['registration']} ({b['routeNumber']}): {b['lat']}, {b['lng']} @ {b['speedKmh']} km/h")
        except urllib.error.URLError as e:
            print(f"[ERR] Failed to send to {TARGET_URL}: {e}")

        time.sleep(INTERVAL_SECONDS)

if __name__ == "__main__":
    stream_telematics()
