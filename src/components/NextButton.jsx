export default function NextButton({ id, ready, hint, onClick, children }) {
  const hintId = `${id}-hint`;
  return (
    <div className="next-block">
      {!ready && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
      <button type="button" className="btn primary" disabled={!ready} aria-describedby={ready ? undefined : hintId} onClick={onClick}>
        {children}
      </button>
    </div>
  );
}
