'use client';

import React from 'react';
import Link from 'next/link';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import {
  X,
  Plus,
  LogOut,
} from 'lucide-react';
import Icon from '@/common/components/ui/Icon';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size: number }>;
}

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  pathname: string;
  user: { name?: string; email?: string; role?: string } | null;
  initials: string;
  onNewBookingClick: () => void;
  onLogout: () => void;
}

export default function MobileDrawer({
  open,
  onClose,
  items,
  pathname,
  user,
  initials,
  onNewBookingClick,
  onLogout,
}: MobileDrawerProps) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 290,
            backgroundColor: alpha(theme.palette.background.default, 0.98),
            backdropFilter: 'blur(25px)',
            borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2,
          },
        },
      }}
    >
      <Box>
        {/* Header Drawer */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.1rem' }}>
            Nagma Tattoo CRM
          </Typography>
          <IconButton onClick={onClose} size="small" aria-label="Chiudi menu" sx={{ minWidth: 44, minHeight: 44 }}>
            <X size={20} />
          </IconButton>
        </Box>

        {/* User Card */}
        {user && (
          <Box
            sx={{
              p: 1.5,
              mb: 2,
              borderRadius: 3,
              backgroundColor: theme.palette.mode === 'light'
                ? alpha(theme.palette.primary.main, 0.06)
                : alpha(theme.palette.common.white, 0.04),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                color: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 700,
              }}
            >
              {initials}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.name || 'Utente'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Action Button: Nuova Prenotazione */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<Plus size={18} />}
          onClick={() => {
            onClose();
            onNewBookingClick();
          }}
          sx={{
            mb: 2,
            py: 1.25,
            minHeight: 44,
            fontWeight: 700,
            borderRadius: 2,
          }}
        >
          Nuova Prenotazione
        </Button>

        <Divider sx={{ my: 1 }} />

        {/* Navigation Links */}
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {items.map((item) => {
            const isActive = pathname === item.href;
            const IconComp = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                style={{ textDecoration: 'none' }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.25,
                    minHeight: 44,
                    borderRadius: 2,
                    color: isActive ? 'primary.main' : 'text.secondary',
                    backgroundColor: isActive
                      ? alpha(theme.palette.primary.main, 0.12)
                      : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'light'
                        ? alpha(theme.palette.primary.main, 0.08)
                        : alpha(theme.palette.common.white, 0.05),
                      color: 'primary.main',
                    },
                  }}
                >
                  <IconComp size={18} />
                  <span>{item.name}</span>
                </Box>
              </Link>
            );
          })}
        </Stack>
      </Box>

      {/* Footer Drawer: Logout */}
      <Box sx={{ pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<LogOut size={18} />}
          onClick={() => {
            onClose();
            onLogout();
          }}
          sx={{
            minHeight: 44,
            fontWeight: 600,
            borderRadius: 2,
          }}
        >
          Disconnetti
        </Button>
      </Box>
    </Drawer>
  );
}
