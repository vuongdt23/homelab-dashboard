import type { CardState } from "../hooks/useStatus.js";
import { ServiceCard } from "./ServiceCard.js";

export function ServiceGrid({ services, host }: { services: CardState[]; host: string }) {
  if (services.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-state__title">No services configured</p>
        <p className="empty-state__body">Add entries to config/services.json to show them here.</p>
      </div>
    );
  }
  return (
    <nav className="service-grid" aria-label="Homelab services">
      {services.map((s) => <ServiceCard key={s.id} service={s} host={host} />)}
    </nav>
  );
}
