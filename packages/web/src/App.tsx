import { useEffect, useState } from "react";
import { useStatus } from "./hooks/useStatus.js";
import { useMetrics } from "./hooks/useMetrics.js";
import { Hero } from "./components/Hero.js";
import { ServiceGrid } from "./components/ServiceGrid.js";

type Theme = "orca" | "whale";
const STORAGE_KEY = "vuong-homelab-theme";

export function App() {
  const [theme, setTheme] = useState<Theme>("orca");
  const [host, setHost] = useState("");
  const services = useStatus();
  const metrics = useMetrics();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "orca" || stored === "whale") setTheme(stored);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);
  useEffect(() => {
    fetch("/api/config").then((r) => r.json()).then((c: { host: string }) => setHost(c.host)).catch(() => {});
  }, []);
  // Preload both theme images so switching is instant.
  useEffect(() => {
    for (const src of ["/orca-pod.webp", "/blue-whale.webp"]) {
      const img = new Image();
      img.src = src;
    }
  }, []);

  const toggle = () => setTheme((t) => (t === "orca" ? "whale" : "orca"));
  const nextLabel = theme === "orca" ? "Blue Whale Day" : "Orca Night";
  const nextEmoji = theme === "orca" ? "🐋" : "🫍";

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="./" aria-label="Vuong Homelab home">
          <span className="brand-mark" aria-hidden="true">VH</span>
          <span className="brand-text">Vuong Homelab</span>
        </a>
        <button className="theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${nextLabel} theme`}>
          <span className="theme-toggle__mark" aria-hidden="true">{nextEmoji}</span>
          <span className="theme-toggle__text">{nextLabel}</span>
        </button>
      </header>
      <main className="launcher">
        <Hero theme={theme} metrics={metrics} />
        <section className="service-zone">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Media Stack</p>
              <h2>Service Launcher</h2>
            </div>
            {host && <span className="section-note">{host}</span>}
          </div>
          <ServiceGrid services={services} host={host} />
        </section>
      </main>
    </div>
  );
}
