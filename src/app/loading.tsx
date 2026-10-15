export default function Loading() {
  return <main className="page-wrap route-loading" aria-busy="true" aria-label="Cargando contenido">
    <div className="page-content">
      <span className="skeleton-line skeleton-kicker" />
      <span className="skeleton-line skeleton-heading" />
      <span className="skeleton-line skeleton-copy" />
      <div className="skeleton-grid">{Array.from({ length: 4 }, (_, index) => <div className="skeleton-card" key={index}><span /><i /><b /></div>)}</div>
    </div>
  </main>;
}
