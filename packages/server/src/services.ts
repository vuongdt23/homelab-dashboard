import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import type { Service } from "@homelab/shared";

export interface DashboardConfig {
  host: string;
  dashboardPort: number;
  services: Service[];
}

/** Shape of config/services.json on disk. host/dashboardPort are optional
 *  there and are normally supplied via environment variables at runtime. */
interface ServicesFile {
  host?: string;
  dashboardPort?: number;
  services: Service[];
}

const CONFIG_PATH =
  process.env.CONFIG_PATH ??
  resolve(dirname(fileURLToPath(import.meta.url)), "../../../config/services.json");

let cached: DashboardConfig | null = null;

export function loadConfig(): DashboardConfig {
  if (!cached) {
    const file = JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as ServicesFile;
    // The homelab host and dashboard port come from the environment so the
    // committed config carries no site-specific address. Fall back to the
    // file, then to safe local defaults.
    const host = process.env.DASHBOARD_HOST ?? file.host ?? "localhost";
    const dashboardPort =
      Number(process.env.DASHBOARD_PORT) || file.dashboardPort || 8770;
    cached = { host, dashboardPort, services: file.services };
  }
  return cached;
}

/** Base URL used for reachability probes and displayed on cards. */
export function serviceUrl(host: string, service: Service): string {
  return `http://${host}:${service.port}`;
}
