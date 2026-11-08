import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { siteSettings } from '@/lib/schema';
import { EMPTY_SOCIAL_LINKS, type SocialLinks } from '@/lib/social-links';
import { isAdminCookieHeader } from '@/lib/admin';

const urlField = z.string().trim().refine((value) => {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}, 'Enter a valid HTTP or HTTPS URL');

const socialLinksSchema = z.object({
  instagram: urlField,
  facebook: urlField,
  pinterest: urlField,
  youtube: urlField,
  x: urlField,
  linkedin: urlField,
});

export async function GET() {
  try {
    const [settings] = await db.select({ socialLinks: siteSettings.socialLinks })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);
    return NextResponse.json(settings?.socialLinks ?? EMPTY_SOCIAL_LINKS);
  } catch (error) {
    console.error('Social links read error', error);
    return NextResponse.json({ error: 'Unable to load social links' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminCookieHeader(request.headers.get('cookie')))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsed = socialLinksSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter valid social profile URLs' }, { status: 400 });

  const socialLinks: SocialLinks = { ...EMPTY_SOCIAL_LINKS, ...parsed.data };

  try {
    await db.insert(siteSettings).values({ id: 1, socialLinks })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { socialLinks, updatedAt: new Date() },
      });
    return NextResponse.json({ success: true, socialLinks: { ...EMPTY_SOCIAL_LINKS, ...socialLinks } });
  } catch (error) {
    console.error('Social links save error', error);
    return NextResponse.json({ error: 'Unable to save social links' }, { status: 500 });
  }
}