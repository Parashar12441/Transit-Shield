import { NextRequest, NextResponse } from "next/server";
import {
  normalizeChaloBus,
  normalizeAis140,
  ingestBuses,
  getLiveIngestedBuses,
  getIngestStats,
  ChaloBusPacket,
  Ais140Packet,
} from "@/lib/services/transit-feed";
import { BusTelemetry } from "@/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = getIngestStats();
  const buses = getLiveIngestedBuses();

  return NextResponse.json({
    success: true,
    service: "NEXUS Transit - Live Telematics & Chalo Ingestion Gateway",
    endpoint: "/api/telematics/ingest",
    status: "ACTIVE_LISTENING",
    stats,
    activeBuses: buses,
    supportedFormats: [
      {
        name: "Chalo Local Bus JSON Feed",
        example: {
          source: "CHALO_LIVE_FEED",
          city: "Kanpur",
          buses: [
            {
              vehicleId: "KNP-101",
              registration: "UP-78-BT-4921",
              routeNumber: "101",
              lat: 26.4725,
              lng: 80.321,
              speedKmh: 32,
              headingDeg: 85,
              occupancy: "SEATS_AVAILABLE",
            },
          ],
        },
      },
      {
        name: "Indian Standard AIS-140 Telematics",
        example: {
          vehicleNumber: "UP-78-BT-4921",
          latitude: 26.4725,
          longitude: 80.321,
          speedKmh: 32,
          heading: 85,
          emergencyState: false,
          ignition: true,
        },
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const normalizedBuses: BusTelemetry[] = [];

    // Case 1: Chalo batch format { source: "CHALO_LIVE_FEED", buses: [...] }
    if (body.buses && Array.isArray(body.buses)) {
      body.buses.forEach((b: ChaloBusPacket, idx: number) => {
        if (typeof b.lat === "number" && typeof b.lng === "number") {
          normalizedBuses.push(normalizeChaloBus(b, idx));
        }
      });
    }
    // Case 2: Array of buses directly
    else if (Array.isArray(body)) {
      body.forEach((b: any, idx: number) => {
        if (typeof b.lat === "number" && typeof b.lng === "number") {
          normalizedBuses.push(normalizeChaloBus(b, idx));
        } else if (typeof b.latitude === "number" && typeof b.longitude === "number") {
          normalizedBuses.push(normalizeAis140(b as Ais140Packet));
        }
      });
    }
    // Case 3: Single Chalo bus { vehicleId, lat, lng, ... }
    else if (typeof body.lat === "number" && typeof body.lng === "number") {
      normalizedBuses.push(normalizeChaloBus(body as ChaloBusPacket, 0));
    }
    // Case 4: Single AIS-140 payload { vehicleNumber, latitude, longitude, ... }
    else if (typeof body.latitude === "number" && typeof body.longitude === "number") {
      normalizedBuses.push(normalizeAis140(body as Ais140Packet));
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid telemetry payload. Expected 'lat'/'lng' or 'latitude'/'longitude'.",
          received: body,
        },
        { status: 400 }
      );
    }

    if (normalizedBuses.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid coordinate pairs found in payload." },
        { status: 400 }
      );
    }

    // Persist to server-side cache
    ingestBuses(normalizedBuses);

    return NextResponse.json({
      success: true,
      receivedCount: normalizedBuses.length,
      buses: normalizedBuses,
      timestamp: Date.now(),
      message: `Successfully ingested ${normalizedBuses.length} live vehicle coordinate(s).`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to parse JSON body: " + err.message },
      { status: 500 }
    );
  }
}
