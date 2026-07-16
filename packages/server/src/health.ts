import type { Service, ServiceStatus } from "@homelab/shared";
import { serviceUrl } from "./services.js";

/**
 * Probe a service for reachability. Any HTTP response (even 4xx/5xx) means the
 * service process is alive → "up". A network error or timeout → "down".
 */
export async function checkService(
  host: string,
  service: Service,
  timeoutMs: number,
): Promise<ServiceStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(serviceUrl(host, service), {
      method: "GET",
      signal: controller.signal,
      redirect: "manual",
    });
    return { id: service.id, status: "up" };
  } catch {
    return { id: service.id, status: "down" };
  } finally {
    clearTimeout(timer);
  }
}

/** Probe all services in parallel; one slow/dead service never blocks others. */
export async function checkAll(
  host: string,
  services: Service[],
  timeoutMs = 2500,
): Promise<ServiceStatus[]> {
  return Promise.all(services.map((s) => checkService(host, s, timeoutMs)));
}
