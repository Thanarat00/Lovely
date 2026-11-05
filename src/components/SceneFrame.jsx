export default function SceneFrame({ index, className, art, children, ...rest }) {
  return (
    <section id={`scene-${index}`} className={`scene ${className}`} data-index={index} aria-labelledby={`title-${index}`} {...rest}>
      {art ? <div className="scene-art">{art}</div> : null}
      <div className="scene-content">{children}</div>
    </section>
  );
}
