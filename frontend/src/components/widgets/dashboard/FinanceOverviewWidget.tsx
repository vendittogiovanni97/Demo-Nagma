"use client";

import { DollarSign, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
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

  const financeData = [
    { name: 'Entrate', value: showData ? (totalIncome || 0.01) : 0.01, color: theme.palette.primary.main },
    { name: 'Uscite', value: showData ? (totalExpense || 0.01) : 0.01, color: theme.palette.error.main },
  ];

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
        sx={{ pb: 1.5, borderBottom: `1px solid ${theme.palette.primary.main}12` }}
      />
      <CardContent>
        {isLoading ? (
          <Stack useFlexGap sx={{ gap: 2 }}>
            <Skeleton variant="rectangular" height={200} />
          </Stack>
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} useFlexGap sx={{ gap: 2, alignItems: 'stretch' }}>
            <Box sx={{ flex: 1, minWidth: 180, minHeight: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={financeData}
                    innerRadius={48}
                    outerRadius={66}
                    paddingAngle={totalIncome > 0 && totalExpense > 0 ? 4 : 0}
                    dataKey="value"
                    stroke="transparent"
                  >
                    {financeData.map((entry, index) => (
                      <Cell key={`finance-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      background: 'rgba(10, 10, 10, 0.95)',
                      border: `1px solid ${theme.palette.primary.main}33`,
                      borderRadius: '12px',
                      padding: '8px 12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Stack useFlexGap sx={{ gap: 1.5, justifyContent: 'center', minWidth: 180 }}>
              <Card
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: `${theme.palette.primary.main}08`,
                  border: `1px solid ${theme.palette.primary.main}20`,
                  transition: theme.transitions.create(['all'], { duration: 300 }),
                  '&:hover': {
                    boxShadow: theme.shadows[1],
                  },
                }}
              >
                <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: theme.palette.primary.main,
                    }}
                  />
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: theme.palette.text.secondary }}>
                    Entrate
                  </Typography>
                </Stack>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {showData ? formatPrice(totalIncome) : '€ ••••••'}
                </Typography>
              </Card>

              <Card
                variant="outlined"
                sx={{
                  p: 1.5,
                  bgcolor: `${theme.palette.error.main}08`,
                  border: `1px solid ${theme.palette.error.main}20`,
                  transition: theme.transitions.create(['all'], { duration: 300 }),
                  '&:hover': {
                    boxShadow: theme.shadows[1],
                  },
                }}
              >
                <Stack direction="row" useFlexGap sx={{ gap: 1, alignItems: 'center', mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: theme.palette.error.main,
                    }}
                  />
                  <Typography variant="caption" sx={{ textTransform: 'uppercase', color: theme.palette.text.secondary }}>
                    Uscite
                  </Typography>
                </Stack>
                <Typography variant="body1" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                  {showData ? formatPrice(totalExpense) : '€ ••••••'}
                </Typography>
              </Card>
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
