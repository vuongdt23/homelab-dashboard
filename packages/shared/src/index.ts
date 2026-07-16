/** A homelab service shown as a launcher card. */
export interface Service {
  /** Stable identifier, also used to look up the icon. */
  id: string;
  /** Display name, e.g. "Jellyfin". */
  name: string;
  /** Short role line, e.g. "Media library and playback". */
  role: string;
  /** Port the service listens on. */
  port: number;
  /** Path to the icon asset served by the frontend, e.g. "icons/jellyfin.svg". */
  icon: string;
  /** Accent color (hex) for the card. */
  accent: string;
}

/** Runtime status of a single service. */
export interface ServiceStatus {
  id: string;
  status: "up" | "down";
}

/** Host resource snapshot. Percentages are 0–100; uptime is seconds. */
export interface HostMetrics {
  cpu: number | null;
  ram: number | null;
  disk: number | null;
  uptimeSeconds: number | null;
}

/** A whale fact from the WaaS API. */
export interface WhaleFact {
  id: string;
  text: string;
  category: string;
  source: string;
  species: string;
}
