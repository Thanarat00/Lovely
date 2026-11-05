export default function Sunflower({ stage = 4, delay = "0s" }) {
  const petals = Array.from({ length: 12 }, (_, index) => index);

  return (
    <div className={`sunflower stage-${stage}`}>
      <div className="plant-scale">
        <div className="plant-sway" style={{ animationDelay: delay }}>
          <svg viewBox="0 0 140 210" aria-hidden="true" focusable="false">
            <g className="seed">
              <ellipse cx="70" cy="184" rx="12" ry="8" fill="#6b4428" />
            </g>
            <g className="sprout">
              <path d="M70 190 C72 170 68 156 70 146" stroke="#4f8a52" strokeWidth="4" fill="none" strokeLinecap="round" />
              <ellipse cx="82" cy="154" rx="10" ry="5" fill="#BBDDB8" transform="rotate(30 82 154)" />
            </g>
            <g className="stem">
              <path d="M70 192 C76 150 64 110 70 74" stroke="#3f7d49" strokeWidth="5" fill="none" strokeLinecap="round" />
              <ellipse cx="48" cy="132" rx="20" ry="8" fill="#7eaf72" transform="rotate(-38 48 132)" />
              <ellipse cx="98" cy="118" rx="20" ry="8" fill="#BBDDB8" transform="rotate(32 98 118)" />
            </g>
            <g className="bud">
              <ellipse cx="70" cy="70" rx="10" ry="14" fill="#7eaf72" />
              <ellipse cx="70" cy="66" rx="6" ry="8" fill="#F6C94C" />
            </g>
            <g className="head">
              {petals.map((index) => (
                <ellipse
                  key={index}
                  cx="70"
                  cy="34"
                  rx="8"
                  ry="18"
                  fill={index % 2 === 0 ? "#F6C94C" : "#ffe7a0"}
                  stroke="#e2b43e"
                  strokeWidth="1"
                  transform={`rotate(${index * 30} 70 58)`}
                />
              ))}
              <circle cx="70" cy="58" r="14" fill="#8A6416" />
              <circle cx="65" cy="54" r="4" fill="#d0922e" />
            </g>
          </svg>
        </div>
      </div>
      <span className="soil-bed" />
    </div>
  );
}

export function SealMark() {
  const petals = Array.from({ length: 10 }, (_, index) => index);
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="29" fill="none" stroke="#fff6d4" strokeWidth="1.5" />
      {petals.map((index) => (
        <ellipse
          key={index}
          cx="32"
          cy="14"
          rx="4"
          ry="9"
          fill="#fff3c4"
          transform={`rotate(${index * 36} 32 32)`}
        />
      ))}
      <circle cx="32" cy="32" r="8" fill="#a86b12" />
    </svg>
  );
}
