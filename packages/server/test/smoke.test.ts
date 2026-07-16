import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApp } from "../src/index.js";
import type { DashboardConfig } from "../src/services.js";

const config: DashboardConfig = {
  host: "localhost",
  dashboardPort: 8770,
  services: [
    { id: "fast", name: "Fast", role: "r", port: 1111, icon: "i", accent: "#000" },
    { id: "slow", name: "Slow", role: "r", port: 2222, icon: "i", accent: "#000" },
  ],
};

beforeEach(() => {
  // "fast" answers immediately (up); "slow" never resolves until aborted (down).
  vi.stubGlobal("fetch", vi.fn((url: string, opts: { signal?: AbortSignal }) => {
    if (url.includes(":1111")) return Promise.resolve(new Response(null, { status: 200 }));
    return new Promise((_res, rej) =>
      opts.signal?.addEventListener("abort", () => rej(new Error("aborted"))),
    );
  }));
});
afterEach(() => vi.restoreAllMocks());

describe("dashboard app", () => {
  it("GET /api/status returns a status per service; a hung service does not block others", async () => {
    const app = createApp(config);
    const res = await app.request("/api/status");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toContainEqual({ id: "fast", status: "up" });
    expect(body).toContainEqual({ id: "slow", status: "down" });
  });

  it("GET /api/metrics returns the metrics shape", async () => {
    const app = createApp(config);
    const res = await app.request("/api/metrics");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("cpu");
    expect(body).toHaveProperty("ram");
    expect(body).toHaveProperty("disk");
    expect(body).toHaveProperty("uptimeSeconds");
  });

  it("GET /api/services omits nothing required by the card", async () => {
    const app = createApp(config);
    const res = await app.request("/api/services");
    const body = await res.json();
    expect(body[0]).toMatchObject({ id: "fast", name: "Fast", port: 1111 });
  });
});
