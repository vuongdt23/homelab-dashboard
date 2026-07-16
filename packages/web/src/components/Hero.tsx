import type { HostMetrics } from "@homelab/shared";
import { useWhaleFact } from "../hooks/useWhaleFact.js";

const THEME_ART: Record<string, { image: string; title: string }> = {
  orca: { image: "/orca-pod.png", title: "Orca Night" },
  whale: { image: "/blue-whale.png", title: "Oceanic Serenity" },
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
    <section className="hero-panel" aria-label={`${art.title} — dashboard hero`}>
      <figure className="hero-art">
        <img src={art.image} width={2000} height={875} alt={`${art.title} artwork`} />
      </figure>
      <div className="hero-copy">
        {fact && (
          <figure className="whale-fact">
            <blockquote className="whale-fact__text">"{fact.text.trim()}"</blockquote>
            <figcaption className="whale-fact__meta">
              <span>Whale Fact</span>
              <button type="button" className="whale-fact__reroll" onClick={reroll} aria-label="Show another whale fact">
                reroll ↻
              </button>
            </figcaption>
          </figure>
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
