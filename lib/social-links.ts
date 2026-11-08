export const SOCIAL_PLATFORMS = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]['id'];
export type SocialLinks = Record<SocialPlatform, string>;

export const EMPTY_SOCIAL_LINKS: SocialLinks = {
  instagram: '',
  facebook: '',
  pinterest: '',
  youtube: '',
  x: '',
  linkedin: '',
};