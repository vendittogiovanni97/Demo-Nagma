"use client";

import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import Badge from '@/common/components/ui/Badge';
import Icon, { AlertTriangle, HelpCircle, ShieldCheck } from '@/common/components/ui/Icon';

interface ConsentStatusBadgeProps {
  booking: {
    id: number;
    formData?: any;
  } | null;
  onClick?: (e: React.MouseEvent) => void;
  iconOnly?: boolean;
}

export default function ConsentStatusBadge({ booking, onClick, iconOnly = false }: ConsentStatusBadgeProps) {
  const theme = useTheme();
  if (!booking) return null;

  const consent = booking.formData?.consent;
  const isSigned = !!consent?.signed;
  const hasAlerts = !!consent?.hasMedicalAlerts;
  const alertsDetails = consent?.medicalAlertsDetails || '';

  // 1. Signed with Medical Alerts (High Warning)
  if (isSigned && hasAlerts) {
    const content = iconOnly ? (
      <IconButtonWithPulse onClick={onClick} paletteKey="error.main" tooltip={`ATTENZIONE SANITARIA: ${alertsDetails}`}>
        <Icon name="alertTriangle" size={15} />
      </IconButtonWithPulse>
    ) : (
      <Badge
        icon={AlertTriangle}
        label="ALLERTA SANITARIA"
        variant="error"
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s',
          '&:hover': onClick ? {
            transform: 'scale(1.02)',
          } : {},
        }}
      />
    );
    return content;
  }

  // 2. Signed & Safe (Green Check)
  if (isSigned) {
    const content = iconOnly ? (
      <Tooltip title="Consenso Informato Firmato" arrow>
        <Box
          onClick={onClick}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'success.main',
            cursor: onClick ? 'pointer' : 'default',
            p: 0.5,
            borderRadius: '50%',
            backgroundColor: alpha(theme.palette.success.main, 0.08),
            '&:hover': onClick ? { backgroundColor: alpha(theme.palette.success.main, 0.16) } : {}
          }}
        >
          <Icon name="shieldCheck" size={14} />
        </Box>
      </Tooltip>
    ) : (
      <Badge
        icon={ShieldCheck}
        label="Consenso Firmato"
        variant="success"
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s',
          '&:hover': onClick ? {
            transform: 'scale(1.02)',
          } : {},
        }}
      />
    );
    return content;
  }

  // 3. Pending / Missing (Grey Outline)
  const content = iconOnly ? (
    <Tooltip title="Consenso Informato Mancante" arrow>
      <Box
        onClick={onClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
          cursor: onClick ? 'pointer' : 'default',
          p: 0.5,
          borderRadius: '50%',
          backgroundColor: alpha(theme.palette.common.white, 0.03),
          '&:hover': onClick ? { backgroundColor: alpha(theme.palette.common.white, 0.08) } : {}
        }}
      >
        <Icon name="helpCircle" size={14} />
      </Box>
    </Tooltip>
  ) : (
    <Badge
        icon={HelpCircle}
      label="Consenso Mancante"
      variant="default"
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          transform: 'scale(1.02)',
        } : {},
      }}
    />
  );
  return content;
}

// Internal Helper for Pulsing Icons (Medical Warnings)
interface IconButtonPulseProps {
  children: React.ReactNode;
  paletteKey: string;
  tooltip: string;
  onClick?: (e: React.MouseEvent) => void;
}

function IconButtonWithPulse({ children, paletteKey, tooltip, onClick }: IconButtonPulseProps) {
  const theme = useTheme();
  const resolvedColor = paletteKey.split('.').reduce((obj: any, key) => obj[key], theme.palette);

  return (
    <Tooltip title={tooltip} arrow>
      <Box
        onClick={onClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          cursor: onClick ? 'pointer' : 'default',
          p: 0.5,
          borderRadius: '50%',
          color: resolvedColor,
          backgroundColor: alpha(resolvedColor, 0.08),
          animation: 'pulse 2s infinite',
          '&:hover': onClick ? { backgroundColor: alpha(resolvedColor, 0.15) } : {},
          '@keyframes pulse': {
            '0%': { boxShadow: `0 0 0 0 ${alpha(resolvedColor, 0.25)}` },
            '70%': { boxShadow: `0 0 0 6px ${alpha(resolvedColor, 0)}` },
            '100%': { boxShadow: `0 0 0 0 ${alpha(resolvedColor, 0)}` },
          },
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
