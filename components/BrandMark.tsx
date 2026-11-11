export function BrandMark({ light = false }: { light?: boolean }) {
  return <a className={`brand-mark${light ? " brand-mark-light" : ""}`} href="#top" aria-label="Sunrise Zonal Teens Church home"><span className="brand-seal"><svg viewBox="0 0 48 48" role="img" aria-label="RCCG"><circle cx="24" cy="26" r="14"/><path d="M24 5v27M19 10h10M18 18h12M11 24c3 2 6 3 13 3s10-1 13-3M14 33c3-2 6-3 10-3s7 1 10 3M8 26h5m22 0h5M20 41h8"/><path d="M24 3l-3 5h6z"/></svg></span><span className="brand-copy"><b>SUNRISE</b><small>ZONAL TEENS CHURCH</small></span></a>;
}
