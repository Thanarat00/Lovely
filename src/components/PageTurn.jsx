export default function PageTurn({ active }) {
  return (
    <div className={active ? "turn is-on" : "turn"} aria-hidden="true">
      <div className="turn-curtain" />
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
