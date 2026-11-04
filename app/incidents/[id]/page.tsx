"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useFleet } from "@/lib/context/FleetContext";
import IncidentCommandPage from "../page";

export default function IncidentDetailPage() {
  const params = useParams();
  const { selectIncident } = useFleet();

  useEffect(() => {
    if (params?.id) {
      selectIncident(String(params.id));
    }
  }, [params?.id, selectIncident]);

  return <IncidentCommandPage />;
}
