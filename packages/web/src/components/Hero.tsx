import type { HostMetrics } from "@homelab/shared";
import { useWhaleFact } from "../hooks/useWhaleFact.js";

const THEME_ART: Record<string, { image: string; title: string; desc: string }> = {
  orca: { image: "/orca-pod.png", title: "Orca Night", desc: "A focused launcher for your media stack over Tailscale." },
  whale: { image: "/blue-whale.png", title: "Oceanic Serenity", desc: "A calm launcher for your media stack over Tailscale." },
};

function pct(v: number | null): string { return v === null ? "—" : `${v}%`; }
function uptime(seconds: number | null): string {
  if (seconds === null) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}

export function Hero({ theme, metrics }: { theme: "orca" | "whale"; metrics: HostMetrics }) {
  const { fact, reroll } = useWhaleFact();
  const art = THEME_ART[theme];
  const stats = [
    { label: "CPU", value: pct(metrics.cpu) },
    { label: "RAM", value: pct(metrics.ram) },
    { label: "Disk", value: pct(metrics.disk) },
    { label: "Uptime", value: uptime(metrics.uptimeSeconds) },
  ];
  return (
    <section className="hero-panel" aria-labelledby="heroTitle">
      <figure className="hero-art">
        <img src={art.image} width={1024} height={1024} alt={`${art.title} artwork`} />
      </figure>
      <div className="hero-copy">
        <p className="theme-label">{art.title}</p>
        <h1 id="heroTitle">{art.title}</h1>
        <p id="heroDescription">{art.desc}</p>
        {fact && (
          <button type="button" className="whale-fact" onClick={reroll} aria-label="Whale fact — tap to reroll">
            <span className="whale-fact__text">"{fact.text.trim()}"</span>
            <span className="whale-fact__meta">Whale Fact · tap to reroll</span>
          </button>
        )}
      </div>
      <div className="hero-metrics" aria-label="Host metrics">
        {stats.map((m) => (
          <div className="metric" key={m.label}>
            <span className="metric__value">{m.value}</span>
            <span className="metric__label">{m.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
