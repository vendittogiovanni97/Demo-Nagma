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
import { useEffect, useState } from "react";
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
  const { isAuthenticated, logout, user, isAdmin, isSuperAdmin } = useAuth();
  const { isSmall, isMedium, isLarge } = useTheme();
  const muiTheme = useMuiTheme();

  // ─── DIMENSIONI ──────────────────────────────────────────────
  const iconSize    = isSmall ? 11 : isMedium ? 12 : 13;
  const navTextSize = isSmall ? '0.4375rem' : isMedium ? '0.5rem' : '0.5rem';
  const logoSize    = isSmall ? 11 : isMedium ? 12 : 13;
  const logoBox     = isSmall ? 18 : 22;
  const plusBtn     = isSmall ? 22 : 24;
  const avatarBtn   = isSmall ? 24 : 26;
  const dividerH    = 16;
  // ─────────────────────────────────────────────────────────────

  const [authChecked, setAuthChecked] = useState(false);
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

  if (!isAuthenticated) {
    if (pathname === '/login') return null;
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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 4, textDecoration: 'none' }}>
            <Box
              sx={{
                width: logoBox,
                height: logoBox,
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
                width={logoSize}
                height={logoSize}
                style={{ width: logoSize, height: logoSize, objectFit: 'contain' }}
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
        </Toolbar>
      </AppBar>
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

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

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
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 4, textDecoration: 'none' }}>
            <Box
              sx={{
                width: logoBox,
                height: logoBox,
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
                width={logoSize}
                height={logoSize}
                style={{ width: logoSize, height: logoSize, objectFit: 'contain' }}
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

          {/* Separatore */}
          <Box sx={{ width: '1px', height: dividerH, backgroundColor: 'rgba(0, 191, 255, 0.12)' }} />

          {/* Nav items */}
          <Stack direction="row" useFlexGap sx={{ gap: 0, display: 'flex', alignItems: 'center' }}>
            {navItems.map((item) => {
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
                    padding: isSmall ? 6 : 10,
                    transition: 'all 0.3s ease',
                    color: isActive ? muiTheme.palette.primary.main : muiTheme.palette.text.secondary,
                    transform: isActive ? 'translateY(-1px)' : 'none',
                    textDecoration: 'none',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = muiTheme.palette.primary.main;
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = muiTheme.palette.text.secondary;
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                    }
                  }}
                >
                  <Icon size={iconSize} />
                  <Typography
                    sx={{
                      fontSize: navTextSize,
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

          {/* Separatore */}
          <Box sx={{ width: '1px', height: dividerH, backgroundColor: 'rgba(0, 191, 255, 0.12)' }} />

          {/* Bottone + */}
          {isLarge && (
            <>
              <IconButton
                onClick={() => setIsBookingOpen(true)}
                sx={{
                  width: plusBtn,
                  height: plusBtn,
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
                <Plus size={iconSize} />
              </IconButton>

              {/* Separatore */}
              <Box sx={{ width: '1px', height: dividerH, backgroundColor: 'rgba(0, 191, 255, 0.12)', mx: 0.25 }} />
            </>
          )}

          {/* Avatar */}
          <IconButton
            onClick={handleUserMenuOpen}
            title={user?.name || user?.email || 'Profilo utente'}
            aria-label="Menu utente"
            sx={{
              width: avatarBtn,
              height: avatarBtn,
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

          {/* Menu utente */}
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
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
            {/* Header menu */}
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

            {/* Voci menu */}
            {[
              { href: '/settings',             icon: Settings,     label: 'Impostazioni',        show: true         },
              { href: '/form-templates',        icon: FileText,     label: 'Form Template',       show: isSuperAdmin },
              { href: '/whatsapp',             icon: MessageSquare, label: 'WhatsApp',            show: isAdmin      },
              { href: '/admin/creams',          icon: Package,      label: 'Vendite Crema',       show: isAdmin      },
              { href: '/admin/booking-history', icon: History,      label: 'Storico Prenotazioni',show: isAdmin      },
              { href: '/spese-libere',          icon: Receipt,      label: 'Spese Libere',        show: true         },
            ].filter((i) => i.show).map(({ href, icon: Icon, label }) => (
              <MenuItem
                key={href}
                component={Link}
                href={href}
                onClick={handleUserMenuClose}
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

            <MenuItem
              onClick={() => { handleUserMenuClose(); logout(); }}
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
        </Toolbar>
      </AppBar>

      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
    </>
  );
}
