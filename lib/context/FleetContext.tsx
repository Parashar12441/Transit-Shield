"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { BusTelemetry, Driver, Incident, IncidentSeverity, NotificationItem, Route, Vehicle } from "@/types";
import { MOCK_ROUTES } from "@/lib/mock-data/routes";
import { createInitialBuses, getRoutePosition, getRouteBearing, MOCK_DRIVERS, MOCK_VEHICLES } from "@/lib/mock-data/buses";
import { calculateBusScheduleState } from "@/lib/mock-data/schedules";
import { INITIAL_INCIDENTS } from "@/lib/mock-data/incidents";
import { normalizeChaloBus } from "@/lib/services/transit-feed";

interface FleetContextType {
  buses: BusTelemetry[];
  routes: Route[];
  incidents: Incident[];
  drivers: Driver[];
  vehicles: Vehicle[];
  notifications: NotificationItem[];
  selectedBusId: string | null;
  selectedIncidentId: string | null;
  selectedRouteId: string | null;
  searchQuery: string;
  isSimulating: boolean;
  isEmergencyModalOpen: boolean;
  isNotificationDrawerOpen: boolean;
  activeIncidentsCount: number;
  criticalIncidentsCount: number;
  unreadNotificationsCount: number;
  telemetryMode: "SIMULATION" | "LIVE_FEED" | "HYBRID";
  liveFeedStats: {
    lastReceivedMs: number;
    liveBusesCount: number;
    totalPackets: number;
  };
  
  selectBus: (busId: string | null) => void;
  selectIncident: (incidentId: string | null) => void;
  selectRoute: (routeId: string | null) => void;
  setSearchQuery: (q: string) => void;
  toggleSimulation: () => void;
  setEmergencyModalOpen: (open: boolean) => void;
  setNotificationDrawerOpen: (open: boolean) => void;
  setTelemetryMode: (mode: "SIMULATION" | "LIVE_FEED" | "HYBRID") => void;
  ingestLiveTelemetry: (rawPayload: any) => void;
  
  triggerSimulatedSos: (targetBusId?: string) => string;
  acknowledgeIncident: (id: string, operatorName?: string) => void;
  startResponding: (id: string, operatorName?: string) => void;
  assignResponder: (id: string, responderName: string) => void;
  escalateIncident: (id: string) => void;
  addIncidentNote: (id: string, note: string) => void;
  resolveIncident: (id: string, resolutionNote?: string) => void;
  closeIncident: (id: string, closeNote?: string) => void;
  
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  assignDriverToVehicle: (driverId: string, vehicleId: string) => void;
  unassignDriver: (vehicleId: string) => void;
  updateRouteConfig: (routeId: string, updates: Partial<Route>) => void;
  resetDemoData: () => void;
}

const FleetContext = createContext<FleetContextType | null>(null);

export function FleetProvider({ children }: { children: React.ReactNode }) {
  const [buses, setBuses] = useState<BusTelemetry[]>(() => createInitialBuses());
  const [routes, setRoutes] = useState<Route[]>(MOCK_ROUTES);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "NOTIF-1",
      incidentId: "INC-1049",
      title: "CRITICAL: Driver SOS Triggered",
      message: "Bus KNP-103 reported driver distress at Rawatpur Station.",
      severity: "CRITICAL",
      timestamp: Date.now() - 420000,
      read: false,
      busId: "KNP-103",
    },
    {
      id: "NOTIF-2",
      incidentId: "INC-1048",
      title: "Telemetry Drop Warning",
      message: "Bus KNP-105 has stopped broadcasting GPS fixes for > 2 mins.",
      severity: "HIGH",
      timestamp: Date.now() - 840000,
      read: false,
      busId: "KNP-105",
    },
    {
      id: "NOTIF-3",
      incidentId: "INC-1047",
      title: "Route Corridor Deviation",
      message: "Bus KNP-107 deviated 280m off designated corridor.",
      severity: "MEDIUM",
      timestamp: Date.now() - 1920000,
      read: true,
      busId: "KNP-107",
    },
  ]);

  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSimulating, setIsSimulating] = useState(true);
  const [isEmergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setNotificationDrawerOpen] = useState(false);
  const [telemetryMode, setTelemetryMode] = useState<"SIMULATION" | "LIVE_FEED" | "HYBRID">("HYBRID");
  const [liveFeedStats, setLiveFeedStats] = useState({
    lastReceivedMs: 0,
    liveBusesCount: 0,
    totalPackets: 0,
  });

  const ingestLiveTelemetry = (rawPayload: any) => {
    let incoming: BusTelemetry[] = [];
    if (Array.isArray(rawPayload)) {
      incoming = rawPayload.map((b, i) => normalizeChaloBus(b, i));
    } else if (rawPayload?.buses && Array.isArray(rawPayload.buses)) {
      incoming = rawPayload.buses.map((b: any, i: number) => normalizeChaloBus(b, i));
    } else if (rawPayload?.lat && rawPayload?.lng) {
      incoming = [normalizeChaloBus(rawPayload, 0)];
    }

    if (incoming.length === 0) return;

    setLiveFeedStats((prev) => ({
      lastReceivedMs: Date.now(),
      liveBusesCount: incoming.length,
      totalPackets: prev.totalPackets + incoming.length,
    }));

    setBuses((prevBuses) => {
      const updated = [...prevBuses];
      for (const inBus of incoming) {
        const existingIdx = updated.findIndex((b) => b.id === inBus.id || b.registration === inBus.registration);
        if (existingIdx >= 0) {
          updated[existingIdx] = {
            ...updated[existingIdx],
            lat: inBus.lat,
            lng: inBus.lng,
            speedKmh: inBus.speedKmh,
            headingDeg: inBus.headingDeg,
            lastSeenMs: inBus.lastSeenMs,
            trackingStatus: inBus.trackingStatus,
            telemetrySource: "CHALO_LIVE_FEED",
          };
        } else {
          updated.push(inBus);
        }
      }
      return updated;
    });
  };

  // Poll server-side live ingestion endpoint when in HYBRID or LIVE_FEED mode
  useEffect(() => {
    if (telemetryMode === "SIMULATION") return;

    const poll = async () => {
      try {
        const res = await fetch("/api/telematics/ingest");
        if (!res.ok) return;
        const data = await res.json();
        if (data.activeBuses && data.activeBuses.length > 0) {
          ingestLiveTelemetry(data.activeBuses);
        }
      } catch {
        // network polling fallback
      }
    };

    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telemetryMode]);

  // Restore state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedInc = localStorage.getItem("nexus_incidents_v2");
      if (savedInc) {
        setIncidents(JSON.parse(savedInc));
      }
      const savedRoutes = localStorage.getItem("nexus_routes_v2");
      if (savedRoutes) {
        const parsed = JSON.parse(savedRoutes);
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          Array.isArray(parsed[0].waypoints) &&
          parsed[0].waypoints.length > 0
        ) {
          setRoutes(parsed);
        }
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  // Save incidents when modified
  useEffect(() => {
    try {
      localStorage.setItem("nexus_incidents_v2", JSON.stringify(incidents));
    } catch {}
  }, [incidents]);

  // Simulation tick loop (every 3 seconds)
  useEffect(() => {
    if (!isSimulating || telemetryMode === "LIVE_FEED") return;

    const interval = setInterval(() => {
      setBuses((prevBuses) => {
        const nowMs = Date.now();
        return prevBuses.map((bus, idx) => {
          // If bus is an externally ingested live feed, preserve its live coordinates
          if (bus.telemetrySource === "CHALO_LIVE_FEED" || bus.telemetrySource === "AIS_140_HARDWARE") {
            return bus;
          }

          const route = routes.find((r) => r.id === bus.routeId) || routes[0];
          const busIndexOnRoute = Math.floor(idx / routes.length);
          const sched = calculateBusScheduleState(route, busIndexOnRoute, nowMs);

          // If vehicle has active critical incident or is intentionally stale, don't move
          const hasCriticalIncident = incidents.some(
            (i) => i.busId === bus.id && i.severity === "CRITICAL" && ["NEW", "RESPONDING"].includes(i.status)
          );

          if (bus.trackingStatus === "STALE" || hasCriticalIncident) {
            return {
              ...bus,
              speedKmh: 0,
              scheduleStatus: {
                ...sched.scheduleStatus,
                scheduleAdherence: "SLIGHT_DELAY",
                delayMinutes: 3,
              },
              activeIncidentId: incidents.find((i) => i.busId === bus.id)?.id,
            };
          }

          return {
            ...bus,
            lat: sched.position[0],
            lng: sched.position[1],
            headingDeg: sched.headingDeg,
            progressFraction: sched.progressFraction,
            progressPercent: Math.round(sched.progressFraction * 100),
            direction: sched.direction,
            speedKmh: sched.speedKmh,
            lastSeenMs: nowMs,
            trackingStatus: "LIVE",
            scheduleStatus: sched.scheduleStatus,
            activeIncidentId: incidents.find((i) => i.busId === bus.id && !["RESOLVED", "CLOSED"].includes(i.status))?.id,
          };
        });
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isSimulating, telemetryMode, incidents, routes]);

  const activeIncidentsCount = useMemo(() => {
    return incidents.filter((i) => !["RESOLVED", "CLOSED"].includes(i.status)).length;
  }, [incidents]);

  const criticalIncidentsCount = useMemo(() => {
    return incidents.filter((i) => i.severity === "CRITICAL" && !["RESOLVED", "CLOSED"].includes(i.status)).length;
  }, [incidents]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Actions
  const selectBus = (id: string | null) => setSelectedBusId(id);
  const selectIncident = (id: string | null) => setSelectedIncidentId(id);
  const selectRoute = (id: string | null) => setSelectedRouteId(id);
  const toggleSimulation = () => setIsSimulating((v) => !v);

  const triggerSimulatedSos = (targetBusId?: string): string => {
    const chosenBus = targetBusId 
      ? buses.find((b) => b.id === targetBusId) || buses[0]
      : buses[Math.floor(Math.random() * buses.length)];

    const newId = `INC-${1050 + incidents.length}`;
    const newIncident: Incident = {
      id: newId,
      type: "DRIVER_SOS",
      title: "DRIVER EMERGENCY SOS (SIMULATION)",
      severity: "CRITICAL",
      status: "NEW",
      busId: chosenBus.id,
      busReg: chosenBus.registration,
      driverName: chosenBus.driverName,
      routeId: chosenBus.routeId,
      routeName: chosenBus.routeName,
      triggeredAt: Date.now(),
      lat: chosenBus.lat,
      lng: chosenBus.lng,
      speedAtIncidentKmh: chosenBus.speedKmh,
      assignedOperator: "",
      origin: "MANUAL_SOS",
      ruleTriggerDetails: "In-app driver panic trigger received via foreground telemetry beacon. High-priority dispatch active.",
      notesCount: 0,
      events: [
        {
          id: `EV-${Date.now()}-1`,
          timestamp: Date.now(),
          actor: `Driver ${chosenBus.driverName}`,
          actorRole: "DRIVER",
          description: "Emergency SOS activated on vehicle terminal. Immediate incident created with real-time GPS coordinates.",
          eventType: "CREATED",
        },
      ],
    };

    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      incidentId: newId,
      title: "CRITICAL: New Driver SOS Received",
      message: `Emergency reported on ${chosenBus.id} (${chosenBus.driverName}). Immediate response required.`,
      severity: "CRITICAL",
      timestamp: Date.now(),
      read: false,
      busId: chosenBus.id,
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setNotifications((prev) => [newNotif, ...prev]);
    setSelectedIncidentId(newId);
    setSelectedBusId(chosenBus.id);

    return newId;
  };

  const acknowledgeIncident = (id: string, operatorName = "Op. Neha Sharma") => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        return {
          ...inc,
          status: "ACKNOWLEDGED",
          acknowledgedAt: Date.now(),
          assignedOperator: inc.assignedOperator || operatorName,
          events: [
            ...inc.events,
            {
              id: `EV-${Date.now()}`,
              timestamp: Date.now(),
              actor: operatorName,
              actorRole: "OPERATOR",
              description: `Incident acknowledged by Control Room Operator ${operatorName}. Response protocol initiated.`,
              eventType: "ACKNOWLEDGED",
            },
          ],
        };
      })
    );
  };

  const startResponding = (id: string, operatorName = "Op. Neha Sharma") => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        return {
          ...inc,
          status: "RESPONDING",
          assignedOperator: inc.assignedOperator || operatorName,
          events: [
            ...inc.events,
            {
              id: `EV-${Date.now()}`,
              timestamp: Date.now(),
              actor: operatorName,
              actorRole: "OPERATOR",
              description: `Response actions underway. Mobile Quick Response team notified. Communication active.`,
              eventType: "STATUS_CHANGE",
            },
          ],
        };
      })
    );
  };

  const assignResponder = (id: string, responderName: string) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        return {
          ...inc,
          assignedOperator: responderName,
          events: [
            ...inc.events,
            {
              id: `EV-${Date.now()}`,
              timestamp: Date.now(),
              actor: "Control Room Supervisor",
              actorRole: "SUPERVISOR",
              description: `Incident assigned to responder ${responderName}.`,
              eventType: "ASSIGNED",
            },
          ],
        };
      })
    );
  };

  const escalateIncident = (id: string) => {
    const severityProgression: IncidentSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        const currentIdx = severityProgression.indexOf(inc.severity);
        const nextSev = severityProgression[Math.min(3, currentIdx + 1)];
        return {
          ...inc,
          severity: nextSev,
          events: [
            ...inc.events,
            {
              id: `EV-${Date.now()}`,
              timestamp: Date.now(),
              actor: "Incident Escalation Engine",
              actorRole: "SYSTEM",
              description: `Incident escalated to ${nextSev} priority due to acknowledgment threshold timer. Senior dispatcher alerted.`,
              eventType: "ESCALATED",
            },
          ],
        };
      })
    );
  };

  const addIncidentNote = (id: string, noteText: string) => {
    if (!noteText.trim()) return;
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        return {
          ...inc,
          notesCount: inc.notesCount + 1,
          events: [
            ...inc.events,
            {
              id: `EV-${Date.now()}`,
              timestamp: Date.now(),
              actor: "Op. Neha Sharma",
              actorRole: "OPERATOR",
              description: `Note: ${noteText.trim()}`,
              eventType: "NOTE",
            },
          ],
        };
      })
    );
  };

  const resolveIncident = (id: string, resolutionNote = "All passengers and vehicle verified safe. Issue resolved.") => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        return {
          ...inc,
          status: "RESOLVED",
          resolvedAt: Date.now(),
          events: [
            ...inc.events,
            {
              id: `EV-${Date.now()}`,
              timestamp: Date.now(),
              actor: "Op. Neha Sharma",
              actorRole: "OPERATOR",
              description: `Incident marked RESOLVED. Resolution notes: ${resolutionNote}`,
              eventType: "RESOLVED",
            },
          ],
        };
      })
    );
  };

  const closeIncident = (id: string, closeNote = "Final audit completed. Log sealed.") => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== id) return inc;
        return {
          ...inc,
          status: "CLOSED",
          closedAt: Date.now(),
          events: [
            ...inc.events,
            {
              id: `EV-${Date.now()}`,
              timestamp: Date.now(),
              actor: "Op. Neha Sharma",
              actorRole: "OPERATOR",
              description: `Incident CLOSED and archived. Closure report: ${closeNote}`,
              eventType: "CLOSED",
            },
          ],
        };
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const assignDriverToVehicle = (driverId: string, vehicleId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, assignedDriverId: driverId } : v))
    );
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, dutyStatus: "ON_DUTY", assignedVehicleId: vehicleId } : d))
    );
    setBuses((prev) =>
      prev.map((b) => (b.id === vehicleId ? { ...b, driverName: driver.name, driverId: driver.id } : b))
    );
  };

  const unassignDriver = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle || !vehicle.assignedDriverId) return;

    const drvId = vehicle.assignedDriverId;
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicleId ? { ...v, assignedDriverId: "" } : v))
    );
    setDrivers((prev) =>
      prev.map((d) => (d.id === drvId ? { ...d, dutyStatus: "AVAILABLE", assignedVehicleId: undefined } : d))
    );
    setBuses((prev) =>
      prev.map((b) => (b.id === vehicleId ? { ...b, driverName: "Unassigned", driverId: "" } : b))
    );
  };

  const updateRouteConfig = (routeId: string, updates: Partial<Route>) => {
    setRoutes((prev) => {
      const nextRoutes = prev.map((r) => (r.id === routeId ? { ...r, ...updates } : r));
      try {
        localStorage.setItem("nexus_routes_v2", JSON.stringify(nextRoutes));
      } catch {}
      return nextRoutes;
    });
  };

  const resetDemoData = () => {
    try {
      localStorage.removeItem("nexus_incidents_v2");
      localStorage.removeItem("nexus_routes_v2");
    } catch {}
    setIncidents(INITIAL_INCIDENTS);
    setRoutes(MOCK_ROUTES);
    setBuses(createInitialBuses());
    setDrivers(MOCK_DRIVERS);
    setVehicles(MOCK_VEHICLES);
    setSelectedBusId(null);
    setSelectedIncidentId(null);
    setSelectedRouteId(null);
  };

  return (
    <FleetContext.Provider
      value={{
        buses,
        routes,
        incidents,
        drivers,
        vehicles,
        notifications,
        selectedBusId,
        selectedIncidentId,
        selectedRouteId,
        searchQuery,
        isSimulating,
        isEmergencyModalOpen,
        isNotificationDrawerOpen,
        activeIncidentsCount,
        criticalIncidentsCount,
        unreadNotificationsCount,
        telemetryMode,
        liveFeedStats,
        selectBus,
        selectIncident,
        selectRoute,
        setSearchQuery,
        toggleSimulation,
        setEmergencyModalOpen,
        setNotificationDrawerOpen,
        setTelemetryMode,
        ingestLiveTelemetry,
        triggerSimulatedSos,
        acknowledgeIncident,
        startResponding,
        assignResponder,
        escalateIncident,
        addIncidentNote,
        resolveIncident,
        closeIncident,
        markNotificationRead,
        markAllNotificationsRead,
        assignDriverToVehicle,
        unassignDriver,
        updateRouteConfig,
        resetDemoData,
      }}
    >
      {children}
    </FleetContext.Provider>
  );
}

export function useFleet() {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error("useFleet must be used within a FleetProvider");
  }
  return context;
}
