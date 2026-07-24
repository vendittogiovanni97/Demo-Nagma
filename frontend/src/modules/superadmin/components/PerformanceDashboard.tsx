'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@/common/components/ui/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import { useTheme, alpha } from '@mui/material/styles';
import { metricsApi, MetricsSummaryData } from '@/modules/metrics/api/metricsApi';
import { useToast } from '@/common/hooks/useToast';
import Icon from '@/common/components/ui/Icon';
import { initWebVitalsTracking } from '@/common/utils/webVitals';

export default function PerformanceDashboard() {
  const theme = useTheme();
  const toast = useToast();
  const [data, setData] = useState<MetricsSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await metricsApi.getSummary();
      setData(res);
    } catch (err: any) {
      toast.error(err.message || 'Errore durante il caricamento delle metriche');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initWebVitalsTracking();
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 15000);
    return () => clearInterval(interval);
  }, [fetchMetrics]);

  const handleReset = async () => {
    try {
      setResetting(true);
      await metricsApi.resetMetrics();
      toast.success('Metriche azzerate con successo!');
      await fetchMetrics();
    } catch (err: any) {
      toast.error(err.message || 'Errore durante l\'azzeramento');
    } finally {
      setResetting(false);
    }
  };

  const getVitalsBadge = (metric: 'lcp' | 'fcp' | 'cls' | 'ttfb', val?: number) => {
    if (val === undefined || val === null) return { label: 'In attesa', color: 'default' as const };
    if (metric === 'lcp') {
      if (val <= 2500) return { label: 'Ottimo (≤2.5s)', color: 'success' as const };
      if (val <= 4000) return { label: 'Accettabile', color: 'warning' as const };
      return { label: 'Critico (>4s)', color: 'error' as const };
    }
    if (metric === 'fcp') {
      if (val <= 1800) return { label: 'Ottimo (≤1.8s)', color: 'success' as const };
      if (val <= 3000) return { label: 'Accettabile', color: 'warning' as const };
      return { label: 'Critico (>3s)', color: 'error' as const };
    }
    if (metric === 'cls') {
      if (val <= 0.1) return { label: 'Ottimo (≤0.1)', color: 'success' as const };
      if (val <= 0.25) return { label: 'Accettabile', color: 'warning' as const };
      return { label: 'Critico (>0.25)', color: 'error' as const };
    }
    // TTFB
    if (val <= 800) return { label: 'Ottimo (≤800ms)', color: 'success' as const };
    if (val <= 1800) return { label: 'Accettabile', color: 'warning' as const };
    return { label: 'Critico (>1.8s)', color: 'error' as const };
  };

  if (loading && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const webVitals = data?.webVitals || {};

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Dashboard Prestazioni & Core Web Vitals
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={fetchMetrics}
            disabled={loading}
            icon={<Icon name="refresh" size={16} />}
          >
            Aggiorna
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={handleReset}
            disabled={resetting}
            icon={<Icon name="refresh" size={16} />}
          >
            Azzera Metriche
          </Button>
        </Box>
      </Box>

      {/* KPI Cards Header */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                Latenza Media API
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mt: 1 }}>
                {data?.avgResponseTimeMs || 0} <Typography component="span" variant="caption">ms</Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}` }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                P95 Response Time
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'secondary.main', mt: 1 }}>
                {data?.p95ResponseTimeMs || 0} <Typography component="span" variant="caption">ms</Typography>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                Percentuale Errore API
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: (data?.errorRatePercent || 0) > 5 ? 'error.main' : 'success.main', mt: 1 }}>
                {data?.errorRatePercent || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                Totale Richieste
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                {data?.totalRequests || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Core Web Vitals Section */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon name="globe" size={20} />
            Core Web Vitals (Misurati dal Browser)
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {(() => {
              const isLight = theme.palette.mode === 'light';
              const boxBg = isLight ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.common.white, 0.03);
              const boxBorder = `1px solid ${isLight ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.common.white, 0.08)}`;
              return (
                <>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: boxBg, border: boxBorder }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        LCP (Largest Contentful Paint)
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, my: 1 }}>
                        {webVitals.lcp !== undefined ? `${(webVitals.lcp / 1000).toFixed(2)}s` : '—'}
                      </Typography>
                      <Chip size="small" label={getVitalsBadge('lcp', webVitals.lcp).label} color={getVitalsBadge('lcp', webVitals.lcp).color} />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: boxBg, border: boxBorder }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        FCP (First Contentful Paint)
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, my: 1 }}>
                        {webVitals.fcp !== undefined ? `${(webVitals.fcp / 1000).toFixed(2)}s` : '—'}
                      </Typography>
                      <Chip size="small" label={getVitalsBadge('fcp', webVitals.fcp).label} color={getVitalsBadge('fcp', webVitals.fcp).color} />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: boxBg, border: boxBorder }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        CLS (Cumulative Layout Shift)
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, my: 1 }}>
                        {webVitals.cls !== undefined ? webVitals.cls : '—'}
                      </Typography>
                      <Chip size="small" label={getVitalsBadge('cls', webVitals.cls).label} color={getVitalsBadge('cls', webVitals.cls).color} />
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: boxBg, border: boxBorder }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        TTFB (Time to First Byte)
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 800, my: 1 }}>
                        {webVitals.ttfb !== undefined ? `${webVitals.ttfb}ms` : '—'}
                      </Typography>
                      <Chip size="small" label={getVitalsBadge('ttfb', webVitals.ttfb).label} color={getVitalsBadge('ttfb', webVitals.ttfb).color} />
                    </Box>
                  </Grid>
                </>
              );
            })()}
          </Grid>
        </CardContent>
      </Card>

      {/* Top Endpoints Latency Table */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Prestazioni Endpoint API (Top 15 per latenza media)
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Metodo</TableCell>
                  <TableCell>Percorso Endpoint</TableCell>
                  <TableCell align="right">Richieste</TableCell>
                  <TableCell align="right">Latenza Media</TableCell>
                  <TableCell align="right">Latenza P95</TableCell>
                  <TableCell align="right">Errori (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.endpoints && data.endpoints.length > 0 ? (
                  data.endpoints.map((ep, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Chip
                          size="small"
                          label={ep.method}
                          color={ep.method === 'GET' ? 'primary' : ep.method === 'POST' ? 'success' : ep.method === 'DELETE' ? 'error' : 'warning'}
                          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{ep.path}</TableCell>
                      <TableCell align="right">{ep.count}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{ep.avgDurationMs} ms</TableCell>
                      <TableCell align="right">{ep.p95DurationMs} ms</TableCell>
                      <TableCell align="right" sx={{ color: ep.errorRatePercent > 0 ? 'error.main' : 'inherit' }}>
                        {ep.errorRatePercent}%
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      Nessuna richiesta registrata al momento
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Slow Requests Log Stream */}
      <Card sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon name="spese" size={20} />
            Log Richieste Lente (&gt; 100ms)
          </Typography>
          <TableContainer component={Paper} elevation={0} sx={{ bgcolor: 'transparent' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Metodo</TableCell>
                  <TableCell>Percorso</TableCell>
                  <TableCell align="right">Status Code</TableCell>
                  <TableCell align="right">Latenza</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.slowRequests && data.slowRequests.length > 0 ? (
                  data.slowRequests.slice(0, 15).map((sr) => (
                    <TableRow key={sr.id}>
                      <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {new Date(sr.timestamp).toLocaleTimeString('it-IT')}
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={sr.method} sx={{ fontSize: '0.68rem' }} />
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{sr.path}</TableCell>
                      <TableCell align="right">
                        <Chip
                          size="small"
                          label={sr.statusCode}
                          color={sr.statusCode < 400 ? 'success' : 'error'}
                          sx={{ fontSize: '0.68rem' }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: sr.durationMs > 1000 ? 'error.main' : 'warning.main' }}>
                        {sr.durationMs} ms
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      Nessuna richiesta lenta registrata
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
