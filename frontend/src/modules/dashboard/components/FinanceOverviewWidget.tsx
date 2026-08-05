"use client";

import DashboardWidgetCard from './DashboardWidgetCard';
import Icon from '@/common/components/ui/Icon';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import MonthPicker from '@/common/components/ui/MonthPicker';
import { formatPrice } from '@/common/shared/utils/format';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import Button from '@/common/components/ui/Button';

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

  // Independent state per ciascuno dei 3 widget (default: nascosti)
  const [showBilancioData, setShowBilancioData] = useState(false);
  const [showEntrateData, setShowEntrateData] = useState(false);
  const [showUsciteData, setShowUsciteData] = useState(false);

  // Independent dates per ciascuno dei 3 widget
  const [bilancioMonth, setBilancioMonth] = useState<Date>(() => monthDate || new Date());
  const [entrateMonth, setEntrateMonth] = useState<Date>(() => monthDate || new Date());
  const [usciteMonth, setUsciteMonth] = useState<Date>(() => monthDate || new Date());

  const handleBilancioMonthChange = (d: Date) => {
    setBilancioMonth(d);
    onMonthChange?.(d);
  };

  const netBalance = totalIncome - totalExpense;
  const isPositive = netBalance >= 0;

  const financeData = useMemo(() => [
    { name: 'Entrate', value: showBilancioData ? (totalIncome || 0.01) : 0.01, color: theme.palette.primary.main },
    { name: 'Uscite', value: showBilancioData ? (totalExpense || 0.01) : 0.01, color: theme.palette.error.main },
  ], [totalIncome, totalExpense, showBilancioData, theme.palette.primary.main, theme.palette.error.main]);

  // Header Actions per WIDGET 1: BILANCIO
  const bilancioHeaderActions = (
    <Stack direction="row" useFlexGap sx={{ gap: 0.25, alignItems: 'center' }}>
      <MonthPicker value={bilancioMonth} onChange={handleBilancioMonthChange} size="sm" />
      <Button
        variant="icon"
        icon={<Icon name="maximize2" size={14} />}
        component={Link}
        href="/finance"
        title="Vedi dettaglio finanza"
        sx={{
          color: theme.palette.primary.main,
          p: 0.25,
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
        }}
      />
      <Button
        variant="icon"
        icon={showBilancioData ? <Icon name="eye" size={14} /> : <Icon name="eyeOff" size={14} />}
        onClick={() => setShowBilancioData(!showBilancioData)}
        title={showBilancioData ? 'Nascondi dati bilancio' : 'Mostra dati bilancio'}
        sx={{
          color: theme.palette.primary.main,
          p: 0.25,
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
        }}
      />
    </Stack>
  );

  // Header Actions per WIDGET 2: ENTRATE
  const entrateHeaderActions = (
    <Stack direction="row" useFlexGap sx={{ gap: 0.25, alignItems: 'center' }}>
      <MonthPicker value={entrateMonth} onChange={setEntrateMonth} size="sm" />
      <Button
        variant="icon"
        icon={showEntrateData ? <Icon name="eye" size={14} /> : <Icon name="eyeOff" size={14} />}
        onClick={() => setShowEntrateData(!showEntrateData)}
        title={showEntrateData ? 'Nascondi entrate' : 'Mostra entrate'}
        sx={{
          color: theme.palette.primary.main,
          p: 0.25,
          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) },
        }}
      />
    </Stack>
  );

  // Header Actions per WIDGET 3: USCITE
  const usciteHeaderActions = (
    <Stack direction="row" useFlexGap sx={{ gap: 0.25, alignItems: 'center' }}>
      <MonthPicker value={usciteMonth} onChange={setUsciteMonth} size="sm" />
      <Button
        variant="icon"
        icon={showUsciteData ? <Icon name="eye" size={14} /> : <Icon name="eyeOff" size={14} />}
        onClick={() => setShowUsciteData(!showUsciteData)}
        title={showUsciteData ? 'Nascondi uscite' : 'Mostra uscite'}
        sx={{
          color: theme.palette.error.main,
          p: 0.25,
          '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) },
        }}
      />
    </Stack>
  );

  return (
    <Grid container spacing={2} sx={{ flex: 1, alignItems: 'stretch' }} className={className}>
      {/* WIDGET 1: BILANCIO CON GRAFICO A CIAMBELLA */}
      <Grid size={{ xs: 12, sm: 6, md: 6.5 }} sx={{ display: 'flex', flexDirection: 'column' }}>
        <DashboardWidgetCard
          title="Bilancio"
          icon="wallet"
          headerActions={bilancioHeaderActions}
          isLoading={isLoading}
        >
          <Box
            sx={{
              flex: 1,
              minHeight: 200,
              position: 'relative',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
                </defs>
                <Pie
                  data={financeData}
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={totalIncome > 0 && totalExpense > 0 ? 6 : 0}
                  dataKey="value"
                  stroke="transparent"
                  animationDuration={1000}
                  cornerRadius={5}
                >
                  <Cell fill="url(#gradientEntrate)" />
                  <Cell fill="url(#gradientUscite)" />
                </Pie>
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
                Bilancio Netto
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  fontFamily: 'Outfit, sans-serif',
                  color: isPositive ? theme.palette.success.main : theme.palette.error.main,
                }}
              >
                {showBilancioData ? formatPrice(netBalance) : '€ ••••••'}
              </Typography>
            </Box>
          </Box>
        </DashboardWidgetCard>
      </Grid>

      {/* WIDGET 2 & 3: ENTRATE ED USCITE */}
      <Grid size={{ xs: 12, sm: 6, md: 5.5 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* WIDGET 2: ENTRATE TOTALI */}
        <DashboardWidgetCard
          title="Entrate"
          icon="trendingUp"
          headerActions={entrateHeaderActions}
          isLoading={isLoading}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1, pt: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.3rem', md: '1.5rem' },
                fontFamily: 'Outfit, sans-serif',
                color: 'primary.main',
              }}
            >
              {showEntrateData ? formatPrice(totalIncome) : '€ ••••••'}
            </Typography>
          </Box>
        </DashboardWidgetCard>

        {/* WIDGET 3: USCITE TOTALI */}
        <DashboardWidgetCard
          title="Uscite"
          icon="trendingDown"
          headerActions={usciteHeaderActions}
          isLoading={isLoading}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 1, pt: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.3rem', md: '1.5rem' },
                fontFamily: 'Outfit, sans-serif',
                color: 'error.main',
              }}
            >
              {showUsciteData ? formatPrice(totalExpense) : '€ ••••••'}
            </Typography>
          </Box>
        </DashboardWidgetCard>
      </Grid>
    </Grid>
  );
}
