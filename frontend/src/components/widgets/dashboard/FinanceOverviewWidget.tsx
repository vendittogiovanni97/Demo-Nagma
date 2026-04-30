"use client";

import { DollarSign, Eye, EyeOff, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import MonthPicker from '@/components/ui/MonthPicker';
import { formatPrice } from '@/utils/format';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';

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
      sx={{
        background: theme.palette.background.paper,
        border: `1px solid ${theme.palette.primary.main}20`,
        borderRadius: 2,
        transition: theme.transitions.create(['all'], { duration: 300 }),
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[3],
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={
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
              <DollarSign size={18} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Panoramica Finanziaria
            </Typography>
          </Stack>
        }
        action={
          <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center' }}>
            {hasMonthControls && (
              <MonthPicker value={monthDate!} onChange={onMonthChange!} />
            )}
            <IconButton
              size="small"
              onClick={() => setShowData(!showData)}
              title={showData ? 'Nascondi dati' : 'Mostra dati'}
              sx={{
                color: theme.palette.primary.main,
                transition: theme.transitions.create(['all'], { duration: 300 }),
                '&:hover': {
                  bgcolor: `${theme.palette.primary.main}15`,
                },
              }}
            >
              {showData ? <Eye size={16} /> : <EyeOff size={16} />}
            </IconButton>
          </Stack>
        }
        sx={{ pb: { xs: 1, md: 1.5 }, borderBottom: `1px solid ${theme.palette.primary.main}12` }}
      />
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 1.5, sm: 2, md: 2.5 }, '&:last-child': { pb: { xs: 1.5, sm: 2, md: 2.5 } } }}>
        {isLoading ? (
          <Stack useFlexGap sx={{ gap: 2 }}>
            <Skeleton variant="rectangular" height={200} />
          </Stack>
        ) : (
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
                        return (
                          <Box
                            sx={{
                              bgcolor: 'rgba(10, 10, 10, 0.95)',
                              backdropFilter: 'blur(8px)',
                              border: `1px solid ${data.color}33`,
                              borderRadius: 2,
                              p: 1.5,
                              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', fontWeight: 800, fontSize: '0.6rem', letterSpacing: '0.1em', display: 'block', mb: 0.5 }}>
                              {data.name}
                            </Typography>
                            <Typography variant="body1" sx={{ color: data.color, fontWeight: 800 }}>
                              {formatPrice(Number(payload[0].value))}
                            </Typography>
                          </Box>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Stack useFlexGap sx={{ gap: { xs: 1.5, md: 2 }, justifyContent: 'center', minWidth: { xs: 140, md: 180 } }}>
              {/* Entrate Card */}
              <Box
                sx={{
                  position: 'relative',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}12 0%, ${theme.palette.primary.main}06 100%)`,
                  border: `1px solid ${theme.palette.primary.main}25`,
                  backdropFilter: 'blur(12px)',
                  overflow: 'hidden',
                  transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], { duration: 300 }),
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${theme.palette.primary.main}15`,
                    borderColor: `${theme.palette.primary.main}40`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    background: `radial-gradient(circle, ${theme.palette.primary.main}15 0%, transparent 70%)`,
                    borderRadius: '50%',
                    transform: 'translate(20px, -20px)',
                  },
                }}
              >
                <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}30, ${theme.palette.primary.main}15)`,
                    }}
                  >
                    <TrendingUp size={14} color={theme.palette.primary.main} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      textTransform: 'uppercase',
                      color: theme.palette.text.secondary,
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Entrate
                  </Typography>
                </Stack>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.2rem', md: '1.4rem' },
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light || theme.palette.primary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {showData ? formatPrice(totalIncome) : '€ ••••••'}
                </Typography>
              </Box>

              {/* Uscite Card */}
              <Box
                sx={{
                  position: 'relative',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.error.main}12 0%, ${theme.palette.error.main}06 100%)`,
                  border: `1px solid ${theme.palette.error.main}25`,
                  backdropFilter: 'blur(12px)',
                  overflow: 'hidden',
                  transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], { duration: 300 }),
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${theme.palette.error.main}15`,
                    borderColor: `${theme.palette.error.main}40`,
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 80,
                    height: 80,
                    background: `radial-gradient(circle, ${theme.palette.error.main}15 0%, transparent 70%)`,
                    borderRadius: '50%',
                    transform: 'translate(20px, -20px)',
                  },
                }}
              >
                <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${theme.palette.error.main}30, ${theme.palette.error.main}15)`,
                    }}
                  >
                    <TrendingDown size={14} color={theme.palette.error.main} />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      textTransform: 'uppercase',
                      color: theme.palette.text.secondary,
                      fontWeight: 700,
                      fontSize: '0.65rem',
                      letterSpacing: '0.08em',
                    }}
                  >
                    Uscite
                  </Typography>
                </Stack>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.2rem', md: '1.4rem' },
                    color: theme.palette.error.main,
                  }}
                >
                  {showData ? formatPrice(totalExpense) : '€ ••••••'}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
