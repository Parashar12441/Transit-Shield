"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useFleet } from "@/lib/context/FleetContext";
import LiveFleetPage from "../page";

export default function FleetDetailPage() {
  const params = useParams();
  const { selectBus } = useFleet();

  useEffect(() => {
    if (params?.id) {
      selectBus(String(params.id));
    }
  }, [params?.id, selectBus]);

  return <LiveFleetPage />;
}
