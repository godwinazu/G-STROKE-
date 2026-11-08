import { Palette, Paintbrush } from 'lucide-react';

export function SiteBackground() {
  return (
    <div className="site-background" aria-hidden="true">
      <div className="site-stars site-stars-small" />
      <div className="site-stars site-stars-medium" />
      <div className="site-stars site-stars-large" />
      <div className="site-art-animation">
        <Palette className="site-art-palette" strokeWidth={1.2} />
        <span className="site-art-stroke" />
        <Paintbrush className="site-art-brush" strokeWidth={1.2} />
      </div>
    </div>
  );
}