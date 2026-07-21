"use client";

import Icon from '@/common/components/ui/Icon';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';


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

  // Memoize financeData to prevent Recharts remount on parent re-render
  // Dependencies: totalIncome, totalExpense, showData (user toggle), theme
  const financeData = useMemo(() => [
    { name: 'Entrate', value: showData ? (totalIncome || 0.01) : 0.01, color: theme.palette.primary.main },
    { name: 'Uscite', value: showData ? (totalExpense || 0.01) : 0.01, color: theme.palette.error.main },
  ], [totalIncome, totalExpense, showData, theme.palette.primary.main, theme.palette.error.main]);

  const hasMonthControls = Boolean(monthDate && onMonthChange);

  return (
    <Card
      className={className}
      variant="glass"
      size="md"
      sx={{
        bgcolor: isLight ? 'background.paper' : alpha(theme.palette.background.default, 0.5),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        boxShadow: isLight
          ? `0 2px 12px ${alpha(theme.palette.common.black, 0.08)}`
          : `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
        transition: theme.transitions.create(['all'], { duration: 300 }),
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.3),
          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.08)}`,
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: { xs: 1, md: 1.5 }, borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
        <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center' }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 1.25,
              bgcolor: `${theme.palette.primary.main}15`,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="dollarSign" size={18} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Panoramica Finanziaria
          </Typography>
        </Stack>
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
                bgcolor: `${theme.palette.primary.main}15`,
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
                bgcolor: `${theme.palette.primary.main}15`,
              },
            }}
          />
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', opacity: isLoading ? 0.65 : 1, transition: 'opacity 0.2s ease-in-out' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} useFlexGap sx={{ gap: { xs: 1.5, md: 2 }, alignItems: 'stretch', flex: 1 }}>
          <Box sx={{ flex: 1, minWidth: { xs: 160, md: 240 }, minHeight: { xs: 160, md: 240 }, position: 'relative' }}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
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
                  >
                    <Cell fill="url(#gradientEntrate)" />
                    <Cell fill="url(#gradientUscite)" />
                  </Pie>
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const actualValue = data.name === 'Entrate' ? totalIncome : totalExpense;
                        return (
                          <Box
                            sx={{
                              bgcolor: isLight ? 'background.paper' : alpha(theme.palette.background.default, 0.95),
                              backdropFilter: 'blur(8px)',
                              border: `1px solid ${data.color}33`,
                              borderRadius: 2,
                              p: 1.5,
                              boxShadow: isLight
                                ? `0 4px 16px ${alpha(theme.palette.common.black, 0.12)}`
                                : `0 8px 32px ${alpha(theme.palette.common.black, 0.4)}`,
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 800, fontSize: '0.6rem', letterSpacing: '0.1em', display: 'block', mb: 0.5 }}>
                              {data.name}
                            </Typography>
                            <Typography variant="body1" sx={{ color: data.color, fontWeight: 800 }}>
                              {formatPrice(actualValue)}
                            </Typography>
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
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

            <Stack useFlexGap sx={{ gap: 2.5, justifyContent: 'center', flex: 1, minWidth: { xs: 160, md: 200 }, px: 1 }}>
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
                <Typography variant="body1" sx={{ fontWeight: 800, color: theme.palette.primary.main }}>
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
                <Typography variant="body1" sx={{ fontWeight: 800, color: theme.palette.error.main }}>
                  {showData ? formatPrice(totalExpense) : '€ ••••••'}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
      </Box>
    </Card>
  );
}
