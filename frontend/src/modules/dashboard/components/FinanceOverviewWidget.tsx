"use client";

import DashboardWidgetCard from './DashboardWidgetCard';
import Icon from '@/common/components/ui/Icon';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';


import MonthPicker from '@/common/components/ui/MonthPicker';
import { formatPrice } from '@/common/shared/utils/format';
import { alpha } from '@mui/material/styles';
import {
  Box,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Skeleton } from '@/common/components/feedback/Skeleton';
import Button from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';

interface FinanceOverviewWidgetProps {
  totalIncome: number;
  totalExpense: number;
  isLoading: boolean;
  className?: string;
  monthDate?: Date;
  onMonthChange?: (date: Date) => void;
}

export default function FinanceOverviewWidget({
  totalIncome,
  totalExpense,
  isLoading,
  className,
  monthDate,
  onMonthChange,
}: FinanceOverviewWidgetProps) {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [showData, setShowData] = useState(true);
  const [activeFinanceItem, setActiveFinanceItem] = useState<'Entrate' | 'Uscite' | null>(null);

  // Memoize financeData to prevent Recharts remount on parent re-render
  // Dependencies: totalIncome, totalExpense, showData (user toggle), theme
  const financeData = useMemo(() => [
    { name: 'Entrate', value: showData ? (totalIncome || 0.01) : 0.01, color: theme.palette.primary.main },
    { name: 'Uscite', value: showData ? (totalExpense || 0.01) : 0.01, color: theme.palette.error.main },
  ], [totalIncome, totalExpense, showData, theme.palette.primary.main, theme.palette.error.main]);

  const hasMonthControls = Boolean(monthDate && onMonthChange);

  const headerActions = (
    <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center' }}>
      {hasMonthControls && (
        <MonthPicker value={monthDate!} onChange={onMonthChange!} />
      )}
      <Button
        variant="icon"
        icon={<Icon name="maximize2" size={16} />}
        onClick={() => {}}
        component={Link}
        href="/finance"
        title="Vedi dettaglio finanza"
        sx={{
          color: theme.palette.primary.main,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          },
        }}
      />
      <Button
        variant="icon"
        icon={showData ? <Icon name="eye" size={16} /> : <Icon name="eyeOff" size={16} />}
        onClick={() => setShowData(!showData)}
        title={showData ? 'Nascondi dati' : 'Mostra dati'}
        sx={{
          color: theme.palette.primary.main,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          },
        }}
      />
    </Stack>
  );

  return (
    <DashboardWidgetCard
      title="Panoramica Finanziaria"
      icon="dollarSign"
      headerActions={headerActions}
      isLoading={isLoading}
      className={className}
    >
      <Stack
        direction="row"
        useFlexGap
        sx={{
          gap: { xs: 1, md: 2 },
          alignItems: 'center',
          flex: 1,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              flex: '1 1 55%',
              minWidth: 0,
              height: { xs: 210, md: 240 },
              position: 'relative',
            }}
          >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart accessibilityLayer={false}>
                  <defs>
                    <linearGradient id="gradientEntrate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={1} />
                      <stop offset="100%" stopColor={theme.palette.primary.dark} stopOpacity={0.8} />
                    </linearGradient>
                    <linearGradient id="gradientUscite" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.palette.error.main} stopOpacity={1} />
                      <stop offset="100%" stopColor={theme.palette.error.dark} stopOpacity={0.8} />
                    </linearGradient>
                    <filter id="shadow">
                      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={theme.palette.primary.main} floodOpacity="0.3" />
                    </filter>
                  </defs>
                  <Pie
                    data={financeData}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={totalIncome > 0 && totalExpense > 0 ? 8 : 0}
                    dataKey="value"
                    stroke="transparent"
                    animationBegin={0}
                    animationDuration={1200}
                    cornerRadius={6}
                    onMouseEnter={(entry) => {
                      if (entry.name === 'Entrate' || entry.name === 'Uscite') {
                        setActiveFinanceItem(entry.name);
                      }
                    }}
                    onMouseLeave={() => setActiveFinanceItem(null)}
                  >
                    <Cell fill="url(#gradientEntrate)" />
                    <Cell fill="url(#gradientUscite)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {activeFinanceItem && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 'calc(50% + 88px)',
                    top: activeFinanceItem === 'Entrate' ? '12%' : 'auto',
                    bottom: activeFinanceItem === 'Uscite' ? '4%' : 'auto',
                    zIndex: 5,
                    pointerEvents: 'none',
                    bgcolor: isLight
                      ? 'background.paper'
                      : alpha(theme.palette.background.default, 0.95),
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${alpha(
                      activeFinanceItem === 'Entrate'
                        ? theme.palette.primary.main
                        : theme.palette.error.main,
                      0.25,
                    )}`,
                    borderRadius: 2,
                    p: 1.5,
                    whiteSpace: 'nowrap',
                    boxShadow: isLight
                      ? `0 4px 16px ${alpha(theme.palette.common.black, 0.12)}`
                      : `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      fontWeight: 800,
                      fontSize: '0.6rem',
                      letterSpacing: '0.1em',
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    {activeFinanceItem}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: activeFinanceItem === 'Entrate'
                        ? 'primary.main'
                        : 'error.main',
                      fontWeight: 800,
                    }}
                  >
                    {formatPrice(
                      activeFinanceItem === 'Entrate' ? totalIncome : totalExpense,
                    )}
                  </Typography>
                </Box>
              )}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: 'uppercase',
                    color: theme.palette.text.secondary,
                    fontWeight: 700,
                    fontSize: '0.625rem',
                    letterSpacing: '0.08em',
                    mb: 0.25,
                  }}
                >
                  Bilancio
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    fontFamily: 'Outfit, sans-serif',
                    color: totalIncome - totalExpense >= 0 ? theme.palette.success.main : theme.palette.error.main,
                  }}
                >
                  {showData ? formatPrice(totalIncome - totalExpense) : '€ ••••••'}
                </Typography>
              </Box>
            </Box>

            <Stack
              useFlexGap
              sx={{
                gap: { xs: 1.5, md: 2.5 },
                justifyContent: 'center',
                flex: '1 1 45%',
                minWidth: 0,
                px: { xs: 0, sm: 1 },
              }}
            >
              {/* Entrate Row */}
              <Stack direction="row" useFlexGap sx={{ alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" useFlexGap sx={{ alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                      boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Entrate
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.primary.main,
                    fontSize: { xs: '0.82rem', md: '1rem' },
                    whiteSpace: 'nowrap',
                  }}
                >
                  {showData ? formatPrice(totalIncome) : '€ ••••••'}
                </Typography>
              </Stack>

              {/* Uscite Row */}
              <Stack direction="row" useFlexGap sx={{ alignItems: 'center', justifyContent: 'space-between', pb: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Stack direction="row" useFlexGap sx={{ alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: theme.palette.error.main,
                      boxShadow: `0 0 10px ${theme.palette.error.main}`,
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
                    Uscite
                  </Typography>
                </Stack>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 800,
                    color: theme.palette.error.main,
                    fontSize: { xs: '0.82rem', md: '1rem' },
                    whiteSpace: 'nowrap',
                  }}
                >
                  {showData ? formatPrice(totalExpense) : '€ ••••••'}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
    </DashboardWidgetCard>
  );
}
