"use client";

import {
  Box,
  Grid,
  Slider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import Badge from '@/common/components/ui/Badge';
import Button from '@/common/components/ui/Button';
import Card from '@/common/components/ui/Card';
import FormInput from '@/common/components/forms/FormInput';
import Icon from '@/common/components/ui/Icon';
import React, { useMemo, useRef, useState } from 'react';

interface BodyMapProps {
  value?: any;
  onChange?: (placement: any) => void;
  readOnly?: boolean;
}

const TATTOO_STYLES = [
  'Fine Line',
  'Realistico (B&G)',
  'Realistico (Colori)',
  'Traditional / Old School',
  'Neo Traditional',
  'Blackwork / Tribal',
  'Giapponese (Irezumi)',
  'Acquerello (Watercolor)',
  'Chicano',
  'Fineline / Minimalista',
];

interface Zone {
  id: string;
  label: string;
  // Bounding rect representation for front view mapping
  frontCoords: { x: number; y: number; w: number; h: number; rx?: number };
  backCoords: { x: number; y: number; w: number; h: number; rx?: number };
}

const ANATOMICAL_ZONES: Zone[] = [
  { id: 'testa', label: 'Testa / Collo', frontCoords: { x: 130, y: 15, w: 40, h: 45, rx: 20 }, backCoords: { x: 130, y: 15, w: 40, h: 45, rx: 20 } },
  { id: 'petto', label: 'Petto / Torace', frontCoords: { x: 105, y: 70, w: 90, h: 45, rx: 6 }, backCoords: { x: 105, y: 70, w: 90, h: 45, rx: 6 } },
  { id: 'addome', label: 'Addome', frontCoords: { x: 110, y: 120, w: 80, h: 40, rx: 4 }, backCoords: { x: 110, y: 120, w: 80, h: 40, rx: 4 } },
  { id: 'schiena-alta', label: 'Schiena Alta', frontCoords: { x: 105, y: 70, w: 90, h: 45, rx: 6 }, backCoords: { x: 105, y: 70, w: 90, h: 45, rx: 6 } },
  { id: 'schiena-bassa', label: 'Zona Lombare', frontCoords: { x: 110, y: 120, w: 80, h: 40, rx: 4 }, backCoords: { x: 110, y: 120, w: 80, h: 40, rx: 4 } },
  { id: 'spalla-sinistra', label: 'Spalla Sinistra', frontCoords: { x: 70, y: 70, w: 30, h: 30, rx: 15 }, backCoords: { x: 200, y: 70, w: 30, h: 30, rx: 15 } },
  { id: 'spalla-destra', label: 'Spalla Destra', frontCoords: { x: 200, y: 70, w: 30, h: 30, rx: 15 }, backCoords: { x: 70, y: 70, w: 30, h: 30, rx: 15 } },
  { id: 'braccio-sinistro', label: 'Braccio Sinistro', frontCoords: { x: 75, y: 105, w: 22, h: 50, rx: 8 }, backCoords: { x: 203, y: 105, w: 22, h: 50, rx: 8 } },
  { id: 'braccio-destro', label: 'Braccio Destro', frontCoords: { x: 203, y: 105, w: 22, h: 50, rx: 8 }, backCoords: { x: 75, y: 105, w: 22, h: 50, rx: 8 } },
  { id: 'avambraccio-sinistro', label: 'Avambraccio Sinistro', frontCoords: { x: 80, y: 160, w: 18, h: 55, rx: 6 }, backCoords: { x: 202, y: 160, w: 18, h: 55, rx: 6 } },
  { id: 'avambraccio-destro', label: 'Avambraccio Destro', frontCoords: { x: 202, y: 160, w: 18, h: 55, rx: 6 }, backCoords: { x: 80, y: 160, w: 18, h: 55, rx: 6 } },
  { id: 'coscia-sinistra', label: 'Coscia Sinistra', frontCoords: { x: 108, y: 215, w: 38, h: 75, rx: 12 }, backCoords: { x: 154, y: 215, w: 38, h: 75, rx: 12 } },
  { id: 'coscia-destra', label: 'Coscia Destra', frontCoords: { x: 154, y: 215, w: 38, h: 75, rx: 12 }, backCoords: { x: 108, y: 215, w: 38, h: 75, rx: 12 } },
  { id: 'polpaccio-sinistro', label: 'Gamba Sinistra', frontCoords: { x: 112, y: 295, w: 30, h: 80, rx: 10 }, backCoords: { x: 158, y: 295, w: 30, h: 80, rx: 10 } },
  { id: 'polpaccio-destra', label: 'Gamba Destra', frontCoords: { x: 158, y: 295, w: 30, h: 80, rx: 10 }, backCoords: { x: 112, y: 295, w: 30, h: 80, rx: 10 } },
];

export default function BodyMap({ value, onChange, readOnly = false }: BodyMapProps) {
  const theme = useTheme();
  const [view, setView] = useState<'FRONT' | 'BACK'>('FRONT');
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const mapRef = useRef<SVGSVGElement | null>(null);

  // Default values
  const activePlacement = useMemo(() => {
    return value || {
      view: 'FRONT',
      zone: '',
      x: 0,
      y: 0,
      sizeCm: 15,
      style: 'Fine Line',
      notes: '',
    };
  }, [value]);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly) return;
    if (!mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Convert to viewBox percentages (viewBox is 300 x 400)
    const xPercent = Math.round((clickX / rect.width) * 300);
    const yPercent = Math.round((clickY / rect.height) * 400);

    // Detect which zone was clicked
    let detectedZone = 'Corpo Generico';
    for (const zone of ANATOMICAL_ZONES) {
      const coords = view === 'FRONT' ? zone.frontCoords : zone.backCoords;
      if (
        xPercent >= coords.x &&
        xPercent <= coords.x + coords.w &&
        yPercent >= coords.y &&
        yPercent <= coords.y + coords.h
      ) {
        detectedZone = zone.label;
        break;
      }
    }

    if (onChange) {
      onChange({
        ...activePlacement,
        view,
        zone: detectedZone,
        x: xPercent,
        y: yPercent,
      });
    }
  };

  const updateField = (key: string, val: any) => {
    if (readOnly) return;
    if (onChange) {
      onChange({
        ...activePlacement,
        [key]: val,
      });
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange(null);
    }
  };

  const hasPin = activePlacement.x > 0 && activePlacement.y > 0 && activePlacement.view === view;

  return (
    <Card size="sm" sx={{
      border: '1px solid var(--color-surface-border)',
      backgroundColor: 'rgba(255,255,255,0.01)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
        <Grid container spacing={3}>

          {/* LEFT COLUMN: INTERACTIVE VISUAL SCANNER */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={1.5} sx={{ alignItems: 'center' }}>

              {/* VIEW CONTROLS */}
              <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.5 }}>
                  MODELLO ANATOMICO
                </Typography>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setView(prev => prev === 'FRONT' ? 'BACK' : 'FRONT')}
                  icon={<Icon name="rotateCw" size={12} />}
                  sx={{
                    borderRadius: '20px',
                    py: 0.4,
                    px: 1.5,
                    fontSize: '0.75rem',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.1)',
                    '&:hover': {
                      borderColor: 'custom.purple',
                      backgroundColor: (t) => `${t.palette.custom.purple}0d`,
                    }
                  }}
                >
                  {view === 'FRONT' ? 'Vista: FRONTE' : 'Vista: RETRO'}
                </Button>
              </Stack>

              {/* INTERACTIVE SVG CONTAINER */}
              <Box sx={{
                width: '100%',
                maxWidth: '280px',
                aspectRatio: '3 / 4',
                position: 'relative',
                borderRadius: '12px',
                backgroundColor: (t) => t.palette.background.default,
                border: '1px solid rgba(255,255,255,0.03)',
                boxShadow: (t) => `inset 0 0 20px ${t.palette.custom.purple}0d`,
                overflow: 'hidden',
                cursor: readOnly ? 'default' : 'crosshair',
              }}>
                <svg
                  ref={mapRef}
                  viewBox="0 0 300 400"
                  width="100%"
                  height="100%"
                  onClick={handleSvgClick}
                  style={{ display: 'block' }}
                >
                  <defs>
                    <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={theme.palette.custom.purple} stopOpacity="1" />
                      <stop offset="100%" stopColor={theme.palette.custom.purple} stopOpacity="0" />
                    </radialGradient>
                    <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Anatomical areas mapping background */}
                  {ANATOMICAL_ZONES.map((zone) => {
                    const coords = view === 'FRONT' ? zone.frontCoords : zone.backCoords;
                    const isHovered = hoveredZone === zone.id;
                    return (
                      <rect
                        key={zone.id}
                        x={coords.x}
                        y={coords.y}
                        width={coords.w}
                        height={coords.h}
                        rx={coords.rx ?? 0}
                        fill={isHovered ? `${theme.palette.custom.purple}2e` : 'rgba(255, 255, 255, 0.015)'}
                        stroke={isHovered ? theme.palette.custom.purple : 'rgba(255, 255, 255, 0.04)'}
                        strokeWidth={1.5}
                        style={{ transition: 'all 0.15s ease-in-out', cursor: readOnly ? 'default' : 'pointer' }}
                        onMouseEnter={() => setHoveredZone(zone.id)}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                    );
                  })}

                  {/* Glow active pinpoint radar */}
                  {hasPin && (
                    <g filter="url(#shadowGlow)">
                      {/* Outer pulsing ring */}
                      <circle
                        cx={activePlacement.x}
                        cy={activePlacement.y}
                        r={12}
                        fill="none"
                        stroke={theme.palette.custom.purple}
                        strokeWidth={2}
                        style={{
                          transformOrigin: `${activePlacement.x}px ${activePlacement.y}px`,
                          animation: 'pulse 1.8s infinite ease-in-out',
                        }}
                      />
                      {/* Pin center point */}
                      <circle
                        cx={activePlacement.x}
                        cy={activePlacement.y}
                        r={5}
                        fill={theme.palette.error.main}
                        stroke="white"
                        strokeWidth={1.5}
                      />
                    </g>
                  )}
                </svg>

                {/* Floating zone indicator */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  backgroundColor: (t) => `${t.palette.background.default}d9`,
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  py: 0.6,
                  px: 1.2,
                  borderRadius: '6px',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem', fontWeight: 600 }}>
                    AREA SELEZIONATA
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, fontSize: '0.75rem' }}>
                    {activePlacement.zone || (readOnly ? 'Nessuna area' : 'Clicca per posizionare')}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Grid>

          {/* RIGHT COLUMN: TECHNICAL METADATA FORM */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'white', letterSpacing: -0.2 }}>
                  Scheda Tecnica di Posizionamento
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Specifica le coordinate anatomiche, lo stile dell'opera e le dimensioni stimate.
                </Typography>
              </Box>

              {activePlacement.zone ? (
                <Stack spacing={2}>

                  {/* ZONE INFO & CLEAR BUTTON */}
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Icon name="mapPin" size={16} className="text-[#9155FD]" />
                      <Badge
                        label={`${activePlacement.zone} (${activePlacement.view === 'FRONT' ? 'Fronte' : 'Retro'})`}
                        size="sm"
                        sx={{
                          backgroundColor: (t) => `${t.palette.custom.purple}1a`,
                          borderColor: (t) => `${t.palette.custom.purple}33`,
                          color: (t) => t.palette.custom.purple,
                        }}
                      />
                    </Stack>
                    {!readOnly && (
                      <Button variant="icon" icon={<Icon name="trash2" size={16} />} onClick={handleClear} sx={{ color: (t) => `${t.palette.common.white}4d`, '&:hover': { color: 'error.main' } }} />
                    )}
                  </Stack>

                  {/* SLIDER FOR SIZE */}
                  <Box>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        DIMENSIONI STIMATE (CM)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'custom.purple', fontWeight: 700 }}>
                        {activePlacement.sizeCm} cm
                      </Typography>
                    </Stack>
                    <Slider
                      value={activePlacement.sizeCm}
                      onChange={(_, val) => updateField('sizeCm', val)}
                      min={2}
                      max={60}
                      step={1}
                      disabled={readOnly}
                      sx={{
                        color: 'custom.purple',
                        '& .MuiSlider-thumb': {
                          border: '2px solid white',
                          boxShadow: (t) => `0 0 10px ${t.palette.custom.purple}80`,
                        },
                      }}
                    />
                  </Box>

                  {/* STYLE SELECTOR */}
                  <FormInput
                    label="Stile del Tatuaggio"
                    value={activePlacement.style}
                    onChange={(v) => updateField('style', v)}
                    disabled={readOnly}
                    size="sm"
                  />

                  {/* ADDITIONAL NOTES */}
                  <FormInput
                    label="Note Specifiche di Posizionamento"
                    value={activePlacement.notes}
                    onChange={(v) => updateField('notes', v)}
                    disabled={readOnly}
                    size="sm"
                    placeholder="Esempio: evitare nei presenti, coprire cicatrice, orientamento angolato..."
                  />

                  {/* COMPLIANCE CHIP */}
                  <Box sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                  }}>
                    <Icon name="info" size={14} color={theme.palette.custom.purple} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4, fontSize: '0.7rem' }}>
                      Queste informazioni tecniche verranno registrate in cartella clinica ed associate alla prenotazione per l'allestimento dello stencil in cabina.
                    </Typography>
                  </Box>

                </Stack>
              ) : (
                <Box sx={{
                  py: 6,
                  px: 2,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  border: '1.5px dashed rgba(255,255,255,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 1.5,
                }}>
                  <Icon name="mapPin" size={28} className="text-text.secondary opacity-30 animate-pulse" />
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, fontSize: '0.8rem' }}>
                      Nessun Posizionamento Registrato
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', maxWidth: '240px', mt: 0.5 }}>
                      {readOnly ? 'Nessun dettaglio inserito per questa prenotazione.' : 'Clicca in un punto qualsiasi della silhouette corporea per definire l\'area del tatuaggio.'}
                    </Typography>
                  </Box>
                </Box>
              )}

            </Stack>
          </Grid>

        </Grid>
    </Card>
  );
}
