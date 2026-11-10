import { BusFront, Clock3, Navigation, Radio, TriangleAlert } from "lucide-react";

export function LiveMap({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`live-map ${compact ? "compact" : ""}`}>
      <div className="map-grid" />
      <svg viewBox="0 0 700 360" preserveAspectRatio="none" aria-label="Élő útvonaltérkép">
        <path
          className="road"
          d="M-20 315 C110 250 85 135 230 170 S390 285 470 155 S610 58 740 25"
        />
        <path
          className="route-line"
          d="M-20 315 C110 250 85 135 230 170 S390 285 470 155 S610 58 740 25"
        />
        {[
          ["118", "238"],
          ["230", "170"],
          ["465", "163"],
          ["640", "63"],
        ].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="9" />
            <circle className="stop-inner" cx={x} cy={y} r="4" />
          </g>
        ))}
      </svg>
      <div className="bus-marker">
        <BusFront />
        <span />
      </div>
      <div className="map-live">
        <Radio /> Élő
      </div>
      <div className="map-panel">
        <div>
          <small>Következő megálló</small>
          <b>Kecskemét</b>
          <span>
            <Clock3 /> 09:14 · 12 perc
          </span>
        </div>
        <div className="eta">
          <strong>12</strong>
          <span>
            perc
            <br />
            késés
          </span>
        </div>
        <p>
          <TriangleAlert /> Forgalmi torlódás az M5-ösön
        </p>
      </div>
      <button className="locate" aria-label="Saját helyzet">
        <Navigation />
      </button>
    </div>
  );
}
