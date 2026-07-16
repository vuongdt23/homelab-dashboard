import { useEffect, useState } from "react";
import type { HostMetrics } from "@homelab/shared";

const EMPTY: HostMetrics = { cpu: null, ram: null, disk: null, uptimeSeconds: null };

export function useMetrics(): HostMetrics {
  const [metrics, setMetrics] = useState<HostMetrics>(EMPTY);
  useEffect(() => {
    let active = true;
    const poll = () => {
      fetch("/api/metrics").then((r) => r.json())
        .then((m: HostMetrics) => { if (active) setMetrics(m); })
        .catch(() => {});
    };
    poll();
    const timer = setInterval(poll, 30_000);
    return () => { active = false; clearInterval(timer); };
  }, []);
  return metrics;
}
