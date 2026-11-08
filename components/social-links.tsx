'use client';

import { useEffect, useState } from 'react';
import { Facebook, Instagram, Linkedin, Pin, Twitter, Youtube, type LucideIcon } from 'lucide-react';
import { SOCIAL_PLATFORMS, type SocialLinks, type SocialPlatform } from '@/lib/social-links';

const icons: Record<SocialPlatform, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  pinterest: Pin,
  youtube: Youtube,
  x: Twitter,
  linkedin: Linkedin,
};

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export function SocialLinks() {
  const [links, setLinks] = useState<Partial<SocialLinks>>({});

  useEffect(() => {
    fetch('/api/social-links')
      .then(async (response) => {
        if (response.ok) setLinks(await response.json());
      })
      .catch(() => undefined);
  }, []);

  const configuredPlatforms = SOCIAL_PLATFORMS.filter((platform) => {
    const url = links[platform.id];
    return Boolean(url && isHttpUrl(url));
  });

  if (!configuredPlatforms.length) return null;

  return (
    <ul className="social-icons" aria-label="Social profiles">
      {configuredPlatforms.map((platform) => {
        const Icon = icons[platform.id];
        const tooltipId = `social-tooltip-${platform.id}`;
        return (
          <li key={platform.id} className="social-icon-content" data-social={platform.id}>
            <a
              href={links[platform.id]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={platform.label}
              aria-describedby={tooltipId}
              className="social-icon-link"
            >
              <span className="social-icon-fill" />
              <Icon aria-hidden="true" className="social-icon" />
            </a>
            <span id={tooltipId} role="tooltip" className="social-tooltip">{platform.label}</span>
          </li>
        );
      })}
    </ul>
  );
}