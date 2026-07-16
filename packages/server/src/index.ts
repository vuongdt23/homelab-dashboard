import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { loadConfig, type DashboardConfig } from "./services.js";
import { checkAll } from "./health.js";
import { readHostMetrics } from "./metrics.js";

export function createApp(config: DashboardConfig, opts: { serveWeb?: boolean } = {}) {
  const app = new Hono();

  app.get("/api/services", (c) =>
    c.json(config.services.map(({ id, name, role, port, icon, accent }) => ({
      id, name, role, port, icon, accent,
    }))),
  );
  app.get("/api/status", async (c) => c.json(await checkAll(config.host, config.services)));
  app.get("/api/metrics", async (c) => c.json(await readHostMetrics()));
  app.get("/api/config", (c) => c.json({ host: config.host }));

  if (opts.serveWeb) {
    const webRoot =
      process.env.WEB_ROOT ??
      resolve(dirname(fileURLToPath(import.meta.url)), "../../web/dist");
    app.use("/*", serveStatic({ root: webRoot }));
    app.get("/*", serveStatic({ path: "index.html", root: webRoot }));
  }
  return app;
}

// Only start a listener when run directly (not when imported by tests).
if (process.env.VITEST === undefined) {
  const config = loadConfig();
  const app = createApp(config, { serveWeb: true });
  serve({ fetch: app.fetch, port: config.dashboardPort }, (info) =>
    console.log(`Dashboard listening on http://0.0.0.0:${info.port}`),
  );
}
