import type { CardState } from "../hooks/useStatus.js";

const LABEL: Record<CardState["status"], string> = {
  up: "Online",
  down: "Offline",
  checking: "Checking",
};

export function ServiceCard({ service, host }: { service: CardState; host: string }) {
  const url = host ? `http://${host}:${service.port}` : undefined;
  return (
    <a
      className="service-card"
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      style={{ ["--service-color" as string]: service.accent }}
    >
      <span className={`status-pill status-pill--${service.status}`}>
        <i className="status-pill__dot" />
        {LABEL[service.status]}
      </span>
      <span className="service-card__icon" aria-hidden="true">
        <img src={service.icon} alt="" decoding="async" loading="lazy" />
      </span>
      <span className="service-card__name">{service.name}</span>
      <span className="service-card__role">{service.role}</span>
      <span className="service-card__destination">{`${host}:${service.port}`}</span>
      <span className="service-card__action">Open service</span>
    </a>
  );
}
