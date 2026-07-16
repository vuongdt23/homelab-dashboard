import { useEffect, useState } from "react";
import type { Service, ServiceStatus } from "@homelab/shared";

export type CardState = Service & { status: "up" | "down" | "checking" };

export function useStatus(): CardState[] {
  const [services, setServices] = useState<Service[]>([]);
  const [statuses, setStatuses] = useState<Record<string, "up" | "down">>({});

  useEffect(() => {
    fetch("/api/services").then((r) => r.json()).then(setServices).catch(() => setServices([]));
  }, []);

  useEffect(() => {
    let active = true;
    const poll = () => {
      fetch("/api/status")
        .then((r) => r.json())
        .then((list: ServiceStatus[]) => {
          if (!active) return;
          setStatuses(Object.fromEntries(list.map((s) => [s.id, s.status])));
        })
        .catch(() => {});
    };
    poll();
    const timer = setInterval(poll, 30_000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  return services.map((s) => ({ ...s, status: statuses[s.id] ?? "checking" }));
}
