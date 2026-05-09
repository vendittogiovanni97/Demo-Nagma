"use client";

import React from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { ShieldCheck, AlertTriangle, HelpCircle } from 'lucide-react';

interface ConsentStatusBadgeProps {
  booking: {
    id: number;
    formData?: any;
  } | null;
  onClick?: (e: React.MouseEvent) => void;
  iconOnly?: boolean;
}

export default function ConsentStatusBadge({ booking, onClick, iconOnly = false }: ConsentStatusBadgeProps) {
  if (!booking) return null;

  const consent = booking.formData?.consent;
  const isSigned = !!consent?.signed;
  const hasAlerts = !!consent?.hasMedicalAlerts;
  const alertsDetails = consent?.medicalAlertsDetails || '';

  // 1. Signed with Medical Alerts (High Warning)
  if (isSigned && hasAlerts) {
    const content = iconOnly ? (
      <IconButtonWithPulse onClick={onClick} color="#EF4444" tooltip={`ATTENZIONE SANITARIA: ${alertsDetails}`}>
        <AlertTriangle size={15} />
      </IconButtonWithPulse>
    ) : (
      <Chip
        icon={<AlertTriangle size={13} className="text-[#EF4444] animate-pulse" />}
        label="ALLERTA SANITARIA"
        size="small"
        onClick={onClick}
        sx={{
          fontSize: '0.65rem',
          fontWeight: 800,
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          color: '#EF4444',
          border: '1.2px solid #EF4444',
          borderRadius: '5px',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s',
          '&:hover': onClick ? {
            backgroundColor: 'rgba(239, 68, 68, 0.16)',
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
            color: '#10B981',
            cursor: onClick ? 'pointer' : 'default',
            p: 0.5,
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            '&:hover': onClick ? { backgroundColor: 'rgba(16, 185, 129, 0.16)' } : {}
          }}
        >
          <ShieldCheck size={14} />
        </Box>
      </Tooltip>
    ) : (
      <Chip
        icon={<ShieldCheck size={12} className="text-[#10B981]" />}
        label="Consenso Firmato"
        size="small"
        onClick={onClick}
        sx={{
          fontSize: '0.65rem',
          fontWeight: 700,
          backgroundColor: 'rgba(16, 185, 129, 0.06)',
          color: '#10B981',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '5px',
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s',
          '&:hover': onClick ? {
            borderColor: '#10B981',
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
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
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          '&:hover': onClick ? { backgroundColor: 'rgba(255, 255, 255, 0.08)' } : {}
        }}
      >
        <HelpCircle size={14} />
      </Box>
    </Tooltip>
  ) : (
    <Chip
      icon={<HelpCircle size={12} className="text-gray-400" />}
      label="Consenso Mancante"
      size="small"
      onClick={onClick}
      sx={{
        fontSize: '0.65rem',
        fontWeight: 600,
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        color: 'text.secondary',
        border: '1px dashed var(--color-surface-border)',
        borderRadius: '5px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        '&:hover': onClick ? {
          borderColor: 'white',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
        } : {},
      }}
    />
  );
  return content;
}

// Internal Helper for Pulsing Icons (Medical Warnings)
interface IconButtonPulseProps {
  children: React.ReactNode;
  color: string;
  tooltip: string;
  onClick?: (e: React.MouseEvent) => void;
}

function IconButtonWithPulse({ children, color, tooltip, onClick }: IconButtonPulseProps) {
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
          color,
          backgroundColor: `${color}15`,
          animation: 'pulse 2s infinite',
          '&:hover': onClick ? { backgroundColor: `${color}25` } : {},
          '@keyframes pulse': {
            '0%': { boxShadow: `0 0 0 0 ${color}40` },
            '70%': { boxShadow: `0 0 0 6px ${color}00` },
            '100%': { boxShadow: `0 0 0 0 ${color}00` },
          },
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
}
