import { BusTelemetry, Incident, Route, HistoricalTrip } from "@/types";

export interface IFleetService {
  getActivePositions(): Promise<BusTelemetry[]>;
  getBusById(busId: string): Promise<BusTelemetry | null>;
  streamPositions(callback: (positions: BusTelemetry[]) => void): () => void;
}

export interface IIncidentService {
  getIncidents(filters?: { severity?: string; status?: string }): Promise<Incident[]>;
  getIncidentById(id: string): Promise<Incident | null>;
  acknowledge(id: string, operator: string): Promise<Incident>;
  assignResponder(id: string, responder: string): Promise<Incident>;
  escalate(id: string): Promise<Incident>;
  resolve(id: string, notes: string): Promise<Incident>;
  close(id: string, notes: string): Promise<Incident>;
}

export interface IRouteService {
  getRoutes(): Promise<Route[]>;
  getRouteById(id: string): Promise<Route | null>;
  updateCorridorThresholds(id: string, corridorM: number, persistenceSec: number): Promise<Route>;
}

export interface ITripService {
  getHistoricalTrips(): Promise<HistoricalTrip[]>;
  getTripReplay(tripId: string): Promise<HistoricalTrip | null>;
}

export interface IAnalyticsService {
  getSummaryMetrics(): Promise<{
    fleetUptimePercent: number;
    meanAckTimeMinutes: number;
    meanResolutionTimeMinutes: number;
    criticalIncidentsLast24h: number;
  }>;
}

// In-browser mock service implementations that can easily be switched to fetch('/api/v1/...')
export class MockFleetService implements IFleetService {
  async getActivePositions(): Promise<BusTelemetry[]> {
    return [];
  }
  async getBusById(): Promise<BusTelemetry | null> {
    return null;
  }
  streamPositions(): () => void {
    return () => {};
  }
}
