"use client";

import { branding } from "@/config/branding";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
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
import {
  Calendar,
  CalendarDays,
  FileText,
  History,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Package,
  Plus,
  Receipt,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import BookingModal from "../modals/BookingModal";

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
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { isAuthenticated, logout, user, isAdmin, isSuperAdmin } = useAuth();
  const { isSmall, isMedium, isLarge } = useTheme();
  const muiTheme = useMuiTheme() as unknown as Theme;

  // Memoize responsive sizing to avoid 57+ calculations per render
  // Dependencies: breakpoint changes (isSmall, isMedium, isLarge)
  const navConfig = useMemo(
    () => ({
      iconSize: isSmall ? 11 : isMedium ? 12 : 13,
      navTextSize: isSmall ? '0.4375rem' : isMedium ? '0.5rem' : '0.5rem',
      logoSize: isSmall ? 11 : isMedium ? 12 : 13,
      logoBox: isSmall ? 18 : 22,
      plusBtn: isSmall ? 22 : 24,
      avatarBtn: isSmall ? 24 : 26,
      dividerH: 16,
    }),
    [isSmall, isMedium, isLarge]
  );

  // Memoize nav item handlers to prevent recreation on every render
  const handleUserMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  }, []);

  const handleUserMenuClose = useCallback(() => {
    setUserMenuAnchor(null);
  }, []);

  useEffect(() => {
    setAuthChecked(true);
  }, []);

  if (!authChecked) {
    return (
      <Box
        component="nav"
        sx={{ height: 44 }}
        suppressHydrationWarning
      />
    );
  }

  // Render unauthenticated navbar (minimal config)
  if (!isAuthenticated) {
    if (pathname === '/login') return null;
    return (
      <UnauthenticatedNavbar navConfig={navConfig} />
    );
  }

  const navItems = [
    { name: "Home",         href: "/",            icon: LayoutGrid   },
    { name: "Agenda",       href: "/agenda",       icon: Calendar     },
    { name: "Prenotazioni", href: "/prenotazioni", icon: CalendarDays },
    { name: "Clienti",      href: "/clienti",      icon: Users        },
    { name: "Team",         href: "/team",         icon: UsersRound   },
  ];

  const initials = getInitials(user?.name, user?.email);

  return (
    <>
      <AppBar
        position="fixed"
        suppressHydrationWarning
        sx={{
          top: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'fit-content',
          maxWidth: 'calc(100% - 24px)',
          right: 'auto',
          backgroundColor: 'rgba(10, 26, 38, 0.86)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 191, 255, 0.12)',
          borderRadius: '100px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.42), 0 0 18px rgba(0, 191, 255, 0.1)',
        }}
      >
        <Toolbar
          sx={{
            py: 0.375,
            px: { xs: 0.75, sm: 1.25 },
            gap: 0.75,
            minHeight: 'unset',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* Logo */}
          <NavbarLogo navConfig={navConfig} />

          {/* Separatore */}
          <Box sx={{ width: '1px', height: navConfig.dividerH, backgroundColor: 'rgba(0, 191, 255, 0.12)' }} />

          {/* Nav items */}
          <NavbarItems
            items={navItems}
            pathname={pathname}
            navConfig={navConfig}
            muiTheme={muiTheme}
          />

          {/* Separatore */}
          <Box sx={{ width: '1px', height: navConfig.dividerH, backgroundColor: 'rgba(0, 191, 255, 0.12)' }} />

          {/* Bottone + (visible on large screens) */}
          {isLarge && (
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

              {/* Separatore */}
              <Box sx={{ width: '1px', height: navConfig.dividerH, backgroundColor: 'rgba(0, 191, 255, 0.12)', mx: 0.25 }} />
            </>
          )}

          {/* Avatar + User Menu */}
          <NavbarUserMenu
            user={user}
            initials={initials}
            userMenuAnchor={userMenuAnchor}
            navConfig={navConfig}
            muiTheme={muiTheme}
            isAdmin={isAdmin}
            isSuperAdmin={isSuperAdmin}
            onMenuOpen={handleUserMenuOpen}
            onMenuClose={handleUserMenuClose}
            onLogout={logout}
          />
        </Toolbar>
      </AppBar>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </>
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
        backgroundColor: 'rgba(10, 26, 38, 0.86)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 191, 255, 0.12)',
        borderRadius: '100px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.42), 0 0 18px rgba(0, 191, 255, 0.1)',
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
  return (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 4, textDecoration: 'none' }}>
      <Box
        sx={{
          width: navConfig.logoBox,
          height: navConfig.logoBox,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(0, 191, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Image
          src={branding.portalLogo}
          alt={branding.portalName}
          width={navConfig.logoSize}
          height={navConfig.logoSize}
          style={{ width: navConfig.logoSize, height: navConfig.logoSize, objectFit: 'contain' }}
        />
      </Box>
      <Typography
        sx={{
          display: { xs: 'none', md: 'block' },
          fontSize: '0.6875rem',
          fontFamily: 'Outfit',
          fontWeight: 600,
          letterSpacing: '0',
          color: '#ffffff',
        }}
      >
        {branding.portalShortName}
      </Typography>
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
}

function NavbarItems({ items, pathname, navConfig, muiTheme }: NavbarItemsProps) {
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
              padding: navConfig.iconSize <= 11 ? 6 : 10,
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

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: NavbarUserMenu
// Purpose: Avatar button + User menu dropdown
// ─────────────────────────────────────────────────────────────────────────────
interface NavbarUserMenuProps {
  user: any;
  initials: string;
  userMenuAnchor: HTMLElement | null;
  navConfig: NavConfigType;
  muiTheme: Theme;
  isAdmin: boolean;
  isSuperAdmin: boolean;
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
      { href: '/settings', icon: Settings, label: 'Impostazioni', show: true },
      { href: '/form-templates', icon: FileText, label: 'Form Template', show: isSuperAdmin },
      { href: '/whatsapp', icon: MessageSquare, label: 'WhatsApp', show: isAdmin },
      { href: '/admin/creams', icon: Package, label: 'Vendite Crema', show: isAdmin },
      { href: '/admin/booking-history', icon: History, label: 'Storico Prenotazioni', show: isAdmin },
      { href: '/spese-libere', icon: Receipt, label: 'Spese Libere', show: true },
    ],
    [isAdmin, isSuperAdmin]
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
          backgroundColor: 'rgba(0, 191, 255, 0.15)',
          border: '1px solid rgba(0, 191, 255, 0.4)',
          color: 'inherit',
          fontSize: '0.5rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 191, 255, 0.25)',
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
              width: 200,
              borderRadius: 2,
              border: '1px solid rgba(0, 191, 255, 0.2)',
              backgroundColor: 'rgba(10, 26, 38, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.42), 0 0 18px rgba(0, 191, 255, 0.1)',
            },
          },
        }}
      >
        {/* User profile header */}
        <Box sx={{ px: 1.5, py: 1, mb: 1, borderBottom: '1px solid rgba(0, 191, 255, 0.12)' }}>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user?.name || 'Utente'}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.5625rem',
              color: muiTheme.palette.text.secondary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user?.email}
          </Typography>
          {user?.role && (
            <Typography
              sx={{
                mt: 0.25,
                fontSize: '0.5rem',
                fontWeight: 700,
                color: muiTheme.palette.primary.main,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
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
                gap: 1.25,
                px: 1.25,
                py: 0.625,
                borderRadius: 1,
                fontSize: '0.6875rem',
                color: muiTheme.palette.text.secondary,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: muiTheme.palette.primary.main,
                },
              }}
            >
              <Icon size={13} />
              <span>{label}</span>
            </MenuItem>
          ))}

        {/* Logout item */}
        <MenuItem
          onClick={handleLogoutClick}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 1.25,
            py: 0.625,
            borderRadius: 1,
            fontSize: '0.6875rem',
            color: muiTheme.palette.text.secondary,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              color: muiTheme.palette.error.main,
            },
          }}
        >
          <LogOut size={13} />
          <span>Logout</span>
        </MenuItem>
      </Menu>
    </>
  );
}
