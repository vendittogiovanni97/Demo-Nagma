const portalName = process.env.NEXT_PUBLIC_PORTAL_NAME || 'Nagma Tattoo CRM';
const portalShortName = process.env.NEXT_PUBLIC_PORTAL_SHORT_NAME || 'Nagma';
const portalDescription =
  process.env.NEXT_PUBLIC_PORTAL_DESCRIPTION || 'Gestionale completo Nagma Tattoo Studio';
const portalLoginTagline =
  process.env.NEXT_PUBLIC_PORTAL_LOGIN_TAGLINE || 'Nagma Tattoo Studio Management';
const portalLogo = process.env.NEXT_PUBLIC_PORTAL_LOGO || '/favicon.ico';

export const branding = {
  portalName,
  portalShortName,
  portalDescription,
  portalLoginTagline,
  portalLogo,
} as const;
