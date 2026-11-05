export function Clouds({ variant = "day" }) {
  const items =
    variant === "dusk"
      ? [
          { left: "4%", top: "12%", width: "150px", duration: "42s" },
          { left: "60%", top: "18%", width: "190px", duration: "58s" },
        ]
      : [
          { left: "-6%", top: "8%", width: "180px", duration: "48s" },
          { left: "42%", top: "14%", width: "220px", duration: "64s" },
          { left: "74%", top: "6%", width: "130px", duration: "36s" },
        ];

  return items.map((item, index) => (
    <span key={`${variant}-${index}`} className="cloud" style={{ left: item.left, top: item.top, width: item.width }}>
      <span className="cloud-drift" style={{ animationDuration: item.duration }}>
        <svg viewBox="0 0 180 80" aria-hidden="true">
          <g fill="#fffaf6" stroke="#ead9c8" strokeWidth="3">
            <ellipse cx="62" cy="48" rx="34" ry="20" />
            <ellipse cx="98" cy="40" rx="40" ry="24" />
            <ellipse cx="132" cy="50" rx="26" ry="16" />
          </g>
        </svg>
      </span>
    </span>
  ));
}

const ARC_COLORS = ["#F6B7C8", "#F6C94C", "#BBDDB8", "#A9D9F3", "#CDB8F5"];

export function RainbowArt({ lit = true }) {
  return (
    <svg className={lit ? "rainbow is-lit" : "rainbow"} viewBox="0 0 800 380" aria-hidden="true">
      {ARC_COLORS.map((color, index) => (
        <path
          key={color}
          className="rainbow-arc"
          d="M70 340 A330 330 0 0 1 730 340"
          pathLength="1"
          stroke={color}
          strokeWidth="18"
          transform={`translate(0 ${index * 16})`}
          style={{ animationDelay: `${index * 0.14}s` }}
        />
      ))}
    </svg>
  );
}

export function Hill() {
  return (
    <svg className="hill" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 150 C240 70 480 210 740 120 C1000 30 1240 180 1440 100 V320 H0 Z" fill="#d7edc8" />
      <path d="M0 200 C300 150 640 260 980 190 C1200 150 1320 220 1440 180 V320 H0 Z" fill="#b7d7a4" />
      <path d="M0 250 C380 220 800 290 1440 230 V320 H0 Z" fill="#8fbf78" />
    </svg>
  );
}

export function SunButton({ onClick }) {
  return (
    <button type="button" className="sun-btn is-live" onClick={onClick} aria-label="พระอาทิตย์">
      <span className="sun-rays" />
      <span className="sun-core" />
    </button>
  );
}

export function Butterfly({ className, onClick }) {
  return (
    <button type="button" className={`butterfly is-live ${className}`} onClick={onClick} aria-label="ผีเสื้อ">
      <svg viewBox="0 0 64 48" aria-hidden="true">
        <g className="wing">
          <ellipse cx="18" cy="18" rx="14" ry="10" fill="#F6B7C8" />
          <ellipse cx="16" cy="31" rx="10" ry="8" fill="#CDB8F5" />
        </g>
        <g className="wing right">
          <ellipse cx="46" cy="18" rx="14" ry="10" fill="#F6C94C" />
          <ellipse cx="48" cy="31" rx="10" ry="8" fill="#F6B7C8" />
        </g>
        <rect x="30" y="12" width="4" height="24" rx="2" fill="#3E3426" />
      </svg>
    </button>
  );
}

export function Pebble({ onClick }) {
  return <button type="button" className="pebble is-live" onClick={onClick} aria-label="ก้อนหินในสวน" />;
}

export function Rain() {
  return (
    <div className="rain" aria-hidden="true">
      {Array.from({ length: 14 }, (_, index) => (
        <span key={index} style={{ left: `${4 + ((index * 7) % 92)}%`, animationDelay: `${index * 0.13}s` }} />
      ))}
    </div>
  );
}
