"use client";

import { branding } from "@/common/config/branding";
import { navItems } from "@/common/config/nav-links";
import { useAuth } from "@/common/context/AuthContext";
import { useBreakpointContext } from "@/common/context/BreakpointContext";
import { useClientConfig } from "@/common/hooks/useClientConfig";
import BookingModal from "@/modules/booking/components/modals/BookingModal";
import {
  AppBar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
  useTheme as useMuiTheme,
  type Theme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  ClipboardList,
  CreditCard,
  DollarSign,
  FileText,
  History,
  LogOut,
  Map,
  MessageSquare,
  Package,
  Plus,
  Banknote,
  Receipt,
  Settings,
  Shield,
  Building2,
  Menu as MenuIcon,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { useThemeMode, ThemeMode } from '@/common/context/ThemeModeContext';
import MobileDrawer from "./MobileDrawer";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSWRConfig } from 'swr';
import { isBookingCacheKey } from '@/modules/booking/api/booking.cache';
import { isFinanceCacheKey } from '@/modules/finance/api/finance.cache';

function getInitials(name?: string, email?: string) {
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    return (first + second).toUpperCase() || first.toUpperCase();
  }
  return (email?.[0] ?? "U").toUpperCase();
}

export default function Navbar() {
  const pathname = usePathname();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const { mutate } = useSWRConfig();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const { isAuthenticated, logout, user, isAdmin, isSuperAdmin } = useAuth();
  const { isSmall, isMedium, isLarge, isXLarge } = useBreakpointContext();
  const muiTheme = useMuiTheme() as unknown as Theme;
  const { themeMode, resolvedTheme, setThemeMode } = useThemeMode();

  const filteredNavItems = useMemo(() => {
    const items = [...navItems];
    if (isSuperAdmin) {
      items.push({
        name: "Admin Panel",
        href: "/admin-panel",
        icon: Shield
      });
    }
    return items;
  }, [isSuperAdmin]);

  // Memoize responsive sizing to avoid 57+ calculations per render
  const navConfig = useMemo(
    () => ({
      iconSize: isSmall ? 14 : isMedium ? 15 : isLarge ? 16 : 18,
      navTextSize: isSmall ? '0.5625rem' : isMedium ? '0.625rem' : isLarge ? '0.6875rem' : '0.75rem',
      logoSize: isSmall ? 14 : isMedium ? 15 : isLarge ? 16 : 18,
      logoBox: isSmall ? 24 : isMedium ? 28 : isLarge ? 30 : 32,
      plusBtn: isSmall ? 28 : isMedium ? 30 : isLarge ? 32 : 34,
      avatarBtn: isSmall ? 28 : isMedium ? 32 : isLarge ? 34 : 36,
      dividerH: isSmall ? 20 : 24,
    }),
    [isSmall, isMedium, isLarge, isXLarge]
  );

  // Memoize nav item handlers
  const handleUserMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  }, []);

  const handleUserMenuClose = useCallback(() => {
    setUserMenuAnchor(null);
  }, []);

  const handleBookingSuccess = useCallback(() => {
    void mutate(isBookingCacheKey);
    void mutate(isFinanceCacheKey);
  }, [mutate]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const initials = getInitials(user?.name, user?.email);

  if (!mounted) {
    return <div style={{ height: 44 }} />;
  }

  return (
    <nav style={{ height: 44 }}>
      {/* Render unauthenticated navbar (minimal config) */}
      {!isAuthenticated ? (
        pathname !== '/login' ? <UnauthenticatedNavbar navConfig={navConfig} /> : null
      ) : (
        <>
          <AppBar
            position="fixed"
            sx={{
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: { xs: '100%', sm: 'fit-content' },
              maxWidth: { xs: '100%', sm: 'calc(100% - 24px)' },
              right: 'auto',
              backgroundColor: resolvedTheme === 'light'
                ? alpha(muiTheme.palette.background.paper, 0.92)
                : alpha(muiTheme.palette.background.default, 0.98),
              backdropFilter: 'blur(30px)',
              border: {
                xs: 'none',
                sm: `1px solid ${resolvedTheme === 'light' ? alpha(muiTheme.palette.common.black, 0.08) : alpha(muiTheme.palette.primary.main, 0.15)}`,
              },
              borderTop: 'none',
              borderRadius: { xs: 0, sm: '0 0 24px 24px' },
              boxShadow: resolvedTheme === 'light'
                ? `0 4px 20px ${alpha(muiTheme.palette.common.black, 0.08)}`
                : `0 10px 40px ${alpha(muiTheme.palette.common.black, 0.6)}`,
              borderBottom: {
                xs: `1px solid ${resolvedTheme === 'light' ? alpha(muiTheme.palette.common.black, 0.08) : alpha(muiTheme.palette.primary.main, 0.15)}`,
                sm: `1px solid ${resolvedTheme === 'light' ? alpha(muiTheme.palette.common.black, 0.08) : alpha(muiTheme.palette.primary.main, 0.15)}`,
              },
            }}
          >
            <Toolbar
              sx={{
                py: { xs: 0.5, sm: 0.375 },
                px: { xs: 1, sm: 1.5 },
                gap: { xs: 0.5, sm: 1 },
                minHeight: 'unset',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflowX: 'auto',
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
              }}
            >
              {isSmall && (
                <IconButton
                  onClick={() => setIsMobileDrawerOpen(true)}
                  aria-label="Menu di navigazione"
                  title="Menu"
                  sx={{
                    width: 44,
                    height: 44,
                    color: muiTheme.palette.primary.main,
                    mr: 0.5,
                  }}
                >
                  <MenuIcon size={22} />
                </IconButton>
              )}
              <NavbarLogo navConfig={navConfig} />
              <Box sx={{ width: '1px', height: navConfig.dividerH, backgroundColor: 'divider' }} />
              {!isSmall && (
                <>
                  <NavbarItems
                    items={filteredNavItems}
                    pathname={pathname}
                    navConfig={navConfig}
                    muiTheme={muiTheme}
                    isXLarge={isXLarge}
                  />
                  <Box sx={{ width: '1px', height: navConfig.dividerH, backgroundColor: 'divider' }} />
                </>
              )}
              {isXLarge && (
                <>
                  <IconButton
                    onClick={() => setIsBookingOpen(true)}
                    aria-label="Nuova prenotazione"
                    title="Nuova prenotazione"
                    sx={{
                      width: navConfig.plusBtn,
                      height: navConfig.plusBtn,
                      padding: 0,
                      borderRadius: '50%',
                      backgroundColor: muiTheme.palette.primary.main,
                      color: muiTheme.palette.background.default,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: muiTheme.palette.primary.light,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Plus size={navConfig.iconSize} />
                  </IconButton>
                  <Box sx={{ width: '1px', height: navConfig.dividerH, backgroundColor: 'divider', mx: 0.25 }} />
                </>
              )}
              <NavbarUserMenu
                user={user}
                initials={initials}
                userMenuAnchor={userMenuAnchor}
                navConfig={navConfig}
                muiTheme={muiTheme}
                isAdmin={isAdmin}
                isSuperAdmin={isSuperAdmin}
                isLarge={isXLarge}
                themeMode={themeMode}
                resolvedTheme={resolvedTheme}
                onThemeChange={setThemeMode}
                onMenuOpen={handleUserMenuOpen}
                onMenuClose={handleUserMenuClose}
                onLogout={logout}
              />
            </Toolbar>
          </AppBar>
          <MobileDrawer
            open={isMobileDrawerOpen}
            onClose={() => setIsMobileDrawerOpen(false)}
            items={filteredNavItems}
            pathname={pathname}
            user={user}
            initials={initials}
            onNewBookingClick={() => setIsBookingOpen(true)}
            onLogout={logout}
          />
          <BookingModal
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            onSuccess={handleBookingSuccess}
            booking={null}
          />
        </>
      )}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: UnauthenticatedNavbar
// Purpose: Render minimal navbar when user not authenticated (avoid code duplication)
// ─────────────────────────────────────────────────────────────────────────────
interface NavConfigType {
  iconSize: number;
  navTextSize: string;
  logoSize: number;
  logoBox: number;
  plusBtn: number;
  avatarBtn: number;
  dividerH: number;
}

function UnauthenticatedNavbar({ navConfig }: { navConfig: NavConfigType }) {
  const localTheme = useMuiTheme() as unknown as Theme;
  return (
    <AppBar
      position="fixed"
      sx={{
        top: 6,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'fit-content',
        maxWidth: 'calc(100% - 24px)',
        right: 'auto',
        backgroundColor: alpha(localTheme.palette.background.default, 0.86),
        backdropFilter: 'blur(20px)',
        border: `1px solid ${alpha(localTheme.palette.primary.main, 0.12)}`,
        borderRadius: '100px',
        boxShadow: `0 8px 24px ${alpha(localTheme.palette.common.black, 0.42)}, 0 0 18px ${alpha(localTheme.palette.primary.main, 0.1)}`,
      }}
    >
      <Toolbar
        sx={{
          py: { xs: 0.375, sm: 0.5 },
          px: { xs: 0.75, sm: 1.25 },
          gap: 0.75,
          minHeight: 'unset',
        }}
      >
        <NavbarLogo navConfig={navConfig} />
      </Toolbar>
    </AppBar>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: NavbarLogo
// Purpose: Extract logo rendering (reused in authenticated + unauthenticated)
// ─────────────────────────────────────────────────────────────────────────────
function NavbarLogo({ navConfig }: { navConfig: NavConfigType }) {
  const theme = useMuiTheme() as unknown as Theme;
  const { clientConfig } = useClientConfig();
  const logoBoxSize = navConfig.logoBox + 26;
  const logoImgSize = navConfig.logoSize + 30;

  const isLight = theme.palette.mode === 'light';

  // Usa logo da ClientConfig se disponibile, altrimenti fallback a branding / logo adattivo al tema
  let logoUrl = clientConfig?.clientLogoUrl || branding.portalLogo || '/logo.svg';
  if (isLight && (logoUrl === '/logo.svg' || !clientConfig?.clientLogoUrl)) {
    logoUrl = '/logo-dark-text.svg';
  }
  const logoAlt = clientConfig?.clientName || branding.portalName;

  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', paddingRight: 4, textDecoration: 'none' }}>
      <Box
        sx={{
          width: logoBoxSize,
          height: logoBoxSize,
          borderRadius: '50%',
          backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.08) : alpha(theme.palette.common.white, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, isLight ? 0.25 : 0.12)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Image
          src={logoUrl}
          alt={logoAlt}
          width={logoImgSize}
          height={logoImgSize}
          priority
          unoptimized
          style={{ width: logoImgSize, height: logoImgSize, objectFit: 'contain' }}
        />
      </Box>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: NavbarItems
// Purpose: Render navigation items with hover effects
// ─────────────────────────────────────────────────────────────────────────────
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size: number }>;
}

interface NavbarItemsProps {
  items: NavItem[];
  pathname: string;
  navConfig: NavConfigType;
  muiTheme: Theme;
  isXLarge: boolean;
}

function NavbarItems({ items, pathname, navConfig, muiTheme, isXLarge }: NavbarItemsProps) {
  // Memoize hover handler to prevent recreation per nav item
  const handleNavItemHover = useCallback((e: React.MouseEvent<HTMLAnchorElement>, isActive: boolean) => {
    if (!isActive) {
      (e.currentTarget as HTMLElement).style.color = muiTheme.palette.primary.main;
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
    }
  }, [muiTheme.palette.primary.main]);

  const handleNavItemLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>, isActive: boolean) => {
    if (!isActive) {
      (e.currentTarget as HTMLElement).style.color = muiTheme.palette.text.secondary;
      (e.currentTarget as HTMLElement).style.transform = 'none';
    }
  }, [muiTheme.palette.text.secondary]);

  return (
    <Stack direction="row" useFlexGap sx={{ gap: 0, display: 'flex', alignItems: 'center' }}>
      {items.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              padding: isXLarge ? 10 : 7,
              transition: 'all 0.3s ease',
              color: isActive ? muiTheme.palette.primary.main : muiTheme.palette.text.secondary,
              transform: isActive ? 'translateY(-1px)' : 'none',
              textDecoration: 'none',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => handleNavItemHover(e, isActive)}
            onMouseLeave={(e) => handleNavItemLeave(e, isActive)}
          >
            <Icon size={navConfig.iconSize} />
            <Typography
              sx={{
                fontSize: navConfig.navTextSize,
                fontWeight: 700,
                letterSpacing: '0.04em',
                fontFamily: 'Outfit',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              {item.name}
            </Typography>
          </Link>
        );
      })}
    </Stack>
  );
}


interface NavbarUserMenuProps {
  user: { name?: string; email?: string; role?: string } | null;
  initials: string;
  userMenuAnchor: HTMLElement | null;
  navConfig: NavConfigType;
  muiTheme: Theme;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLarge: boolean;
  SHOW_POSIZIONAMENTO?: boolean;
  SHOW_CONSENSI?: boolean;
  themeMode?: ThemeMode;
  resolvedTheme?: 'light' | 'dark';
  onThemeChange?: (mode: ThemeMode) => void;
  onMenuOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onMenuClose: () => void;
  onLogout: () => void;
}

function NavbarUserMenu({
  user,
  initials,
  userMenuAnchor,
  navConfig,
  muiTheme,
  isAdmin,
  isSuperAdmin,
  isLarge,
  SHOW_POSIZIONAMENTO,
  SHOW_CONSENSI,
  themeMode,
  resolvedTheme,
  onThemeChange,
  onMenuOpen,
  onMenuClose,
  onLogout,
}: NavbarUserMenuProps) {
  const handleLogoutClick = useCallback(() => {
    onMenuClose();
    onLogout();
  }, [onMenuClose, onLogout]);

  const menuItems = useMemo(
    () => [
      { href: '/finance', icon: DollarSign, label: 'Finanza', show: isAdmin },
      { href: '/form-templates', icon: FileText, label: 'Form Template', show: isSuperAdmin },
      { href: '/posizionamento', icon: Map, label: 'Mappa Corporea', show: isSuperAdmin && SHOW_POSIZIONAMENTO },
      { href: '/consensi', icon: ClipboardList, label: 'Archivio Consensi', show: isSuperAdmin && SHOW_CONSENSI },

      { href: '/whatsapp', icon: MessageSquare, label: 'WhatsApp', show: isAdmin },
      { href: '/creams', icon: Package, label: 'Vendite Crema', show: isAdmin },
      { href: '/booking-history', icon: History, label: 'Storico Prenotazioni', show: isAdmin },
      { href: '/spese-libere', icon: Receipt, label: 'Spese Libere', show: true },
      { href: '/entrate-libere', icon: Banknote, label: 'Entrate Libere', show: true },
      { href: '/acconti', icon: CreditCard, label: 'Acconti', show: true },
      { href: '/affitti', icon: Building2, label: 'Affitti Postazione', show: true },
      { href: '/impostazioni', icon: Settings, label: 'Impostazioni', show: isAdmin },
    ],
    [isAdmin, isSuperAdmin, SHOW_POSIZIONAMENTO, SHOW_CONSENSI]
  );

  return (
    <>
      {/* Avatar button */}
      <IconButton
        onClick={onMenuOpen}
        title={user?.name || user?.email || 'Profilo utente'}
        aria-label="Menu utente"
        sx={{
          width: navConfig.avatarBtn,
          height: navConfig.avatarBtn,
          padding: 0,
          borderRadius: '50%',
          backgroundColor: alpha(muiTheme.palette.primary.main, muiTheme.palette.mode === 'light' ? 0.12 : 0.25),
          border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.4)}`,
          color: muiTheme.palette.primary.main,
          fontSize: '0.625rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: alpha(muiTheme.palette.primary.main, 0.3),
            borderColor: muiTheme.palette.primary.main,
          },
        }}
      >
        {initials}
      </IconButton>

      {/* User dropdown menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={onMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: isLarge ? 240 : 200,
              borderRadius: 3,
              border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.2)}`,
              backgroundColor: alpha(muiTheme.palette.background.default, 0.98),
              backdropFilter: 'blur(30px)',
              boxShadow: `0 12px 40px ${alpha(muiTheme.palette.common.black, 0.6)}, 0 0 20px ${alpha(muiTheme.palette.primary.main, 0.15)}`,
              mt: 1,
            },
          },
        }}
      >
        {/* User profile header */}
        <Box sx={{ px: isLarge ? 2.5 : 2, py: isLarge ? 2 : 1.5, mb: 1, borderBottom: `1px solid ${alpha(muiTheme.palette.primary.main, 0.12)}` }}>
          <Typography
            sx={{
              fontSize: isLarge ? '0.9rem' : '0.75rem',
              fontWeight: 800,
              color: 'text.primary',
              lineHeight: 1.2,
              mb: 0.25,
            }}
          >
            {user?.name || 'Utente'}
          </Typography>
          <Typography
            sx={{
              fontSize: isLarge ? '0.75rem' : '0.625rem',
              color: muiTheme.palette.text.secondary,
              mb: 1,
            }}
          >
            {user?.email}
          </Typography>
          {user?.role && (
            <Typography
              sx={{
                display: 'inline-block',
                fontSize: isLarge ? '0.6rem' : '0.5rem',
                fontWeight: 800,
                color: muiTheme.palette.primary.main,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: alpha(muiTheme.palette.primary.main, 0.1),
              }}
            >
              {user.role}
            </Typography>
          )}
        </Box>

        {/* Menu items (filtered by user role) */}
        {menuItems
          .filter((i) => i.show)
          .map(({ href, icon: Icon, label }) => (
            <MenuItem
              key={href}
              component={Link}
              href={href}
              onClick={onMenuClose}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: isLarge ? 1.5 : 1.25,
                px: isLarge ? 2 : 1.25,
                py: isLarge ? 1 : 0.625,
                borderRadius: 1.5,
                mx: 0.5,
                fontSize: isLarge ? '0.8125rem' : '0.6875rem',
                fontWeight: 500,
                color: muiTheme.palette.text.secondary,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.common.white, 0.05),
                  color: muiTheme.palette.primary.main,
                  transform: 'translateX(4px)',
                },
              }}
            >
              <Icon size={isLarge ? 16 : 13} />
              <span>{label}</span>
            </MenuItem>
          ))}

        {/* Theme switcher */}
        {onThemeChange && (
          <Box sx={{ px: isLarge ? 2 : 1.5, py: isLarge ? 1 : 0.75, borderTop: `1px solid ${alpha(muiTheme.palette.divider, 0.5)}`, mt: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
              <Box component="span" sx={{ fontSize: isLarge ? '0.75rem' : '0.625rem', fontWeight: 600, color: muiTheme.palette.text.secondary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Tema
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {([['light', Sun, 'Chiaro'], ['dark', Moon, 'Scuro'], ['system', Monitor, 'Sistema']] as const).map(([mode, Icon, label]) => (
                <Box
                  key={mode}
                  component="button"
                  onClick={() => onThemeChange(mode as ThemeMode)}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.4,
                    py: isLarge ? 0.75 : 0.5,
                    border: `1px solid ${themeMode === mode ? muiTheme.palette.primary.main : alpha(muiTheme.palette.divider, 0.5)}`,
                    borderRadius: 1.5,
                    backgroundColor: themeMode === mode ? alpha(muiTheme.palette.primary.main, 0.12) : 'transparent',
                    color: themeMode === mode ? muiTheme.palette.primary.main : muiTheme.palette.text.secondary,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: muiTheme.palette.primary.main,
                      backgroundColor: alpha(muiTheme.palette.primary.main, 0.08),
                      color: muiTheme.palette.primary.main,
                    },
                  }}
                >
                  <Icon size={isLarge ? 14 : 12} />
                  <Box component="span" sx={{ fontSize: isLarge ? '0.6rem' : '0.55rem', fontWeight: 600 }}>{label}</Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Logout item */}
        <MenuItem
          onClick={handleLogoutClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: isLarge ? 1.5 : 1.25,
            px: isLarge ? 2 : 1.25,
            py: isLarge ? 1 : 0.625,
            borderRadius: 1.5,
            mx: 0.5,
            mt: 0.5,
            fontSize: isLarge ? '0.8125rem' : '0.6875rem',
            fontWeight: 600,
            color: muiTheme.palette.error.main,
            transition: 'all 0.2s ease',
            opacity: 0.8,
            '&:hover': {
               backgroundColor: alpha(muiTheme.palette.error.main, 0.1),
              opacity: 1,
              transform: 'translateX(4px)',
            },
          }}
        >
          <LogOut size={isLarge ? 16 : 13} />
          <span>Logout</span>
        </MenuItem>
      </Menu>
    </>
  );
}
