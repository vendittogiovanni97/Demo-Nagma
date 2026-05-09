"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Info, MapPin, RotateCw, Trash2 } from 'lucide-react';
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
    <Card sx={{
      border: '1px solid var(--color-surface-border)',
      backgroundColor: 'rgba(255,255,255,0.01)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      <CardContent sx={{ p: 2.5 }}>
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
                  size="small"
                  variant="outlined"
                  onClick={() => setView(prev => prev === 'FRONT' ? 'BACK' : 'FRONT')}
                  startIcon={<RotateCw size={12} />}
                  sx={{
                    borderRadius: '20px',
                    py: 0.4,
                    px: 1.5,
                    fontSize: '0.75rem',
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                      borderColor: '#9155FD',
                      backgroundColor: 'rgba(145, 85, 253, 0.05)',
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
                backgroundColor: '#0c0f1d',
                border: '1px solid rgba(255,255,255,0.03)',
                boxShadow: 'inset 0 0 20px rgba(145, 85, 253, 0.05)',
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
                      <stop offset="0%" stopColor="#9155FD" stopOpacity="1" />
                      <stop offset="100%" stopColor="#9155FD" stopOpacity="0" />
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
                        fill={isHovered ? 'rgba(145, 85, 253, 0.18)' : 'rgba(255, 255, 255, 0.015)'}
                        stroke={isHovered ? '#9155FD' : 'rgba(255, 255, 255, 0.04)'}
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
                        stroke="#9155FD"
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
                        fill="#EF4444"
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
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
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
                      <MapPin size={16} className="text-[#9155FD]" />
                      <Chip
                        label={`${activePlacement.zone} (${activePlacement.view === 'FRONT' ? 'Fronte' : 'Retro'})`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(145, 85, 253, 0.1)',
                          border: '1px solid rgba(145, 85, 253, 0.2)',
                          color: '#A78BFA',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Stack>
                    {!readOnly && (
                      <IconButton onClick={handleClear} size="small" sx={{ color: 'rgba(255,255,255,0.3)', '&:hover': { color: '#EF4444' } }}>
                        <Trash2 size={16} />
                      </IconButton>
                    )}
                  </Stack>

                  {/* SLIDER FOR SIZE */}
                  <Box>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        DIMENSIONI STIMATE (CM)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9155FD', fontWeight: 700 }}>
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
                        color: '#9155FD',
                        '& .MuiSlider-thumb': {
                          border: '2px solid white',
                          boxShadow: '0 0 10px rgba(145,85,253,0.5)',
                        },
                      }}
                    />
                  </Box>

                  {/* STYLE SELECTOR */}
                  <TextField
                    select
                    label="Stile del Tatuaggio"
                    value={activePlacement.style}
                    onChange={(e) => updateField('style', e.target.value)}
                    disabled={readOnly}
                    fullWidth
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': { color: 'white', fontSize: '0.85rem' },
                    }}
                  >
                    {TATTOO_STYLES.map((style) => (
                      <MenuItem key={style} value={style} sx={{ fontSize: '0.85rem' }}>
                        {style}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* ADDITIONAL NOTES */}
                  <TextField
                    label="Note Specifiche di Posizionamento"
                    value={activePlacement.notes}
                    onChange={(e) => updateField('notes', e.target.value)}
                    disabled={readOnly}
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Esempio: evitare nei presenti, coprire cicatrice, orientamento angolato..."
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': { color: 'white', fontSize: '0.85rem' },
                    }}
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
                    <Info size={14} className="text-[#9155FD] shrink-0 mt-0.5" />
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
                  <MapPin size={28} className="text-text.secondary opacity-30 animate-pulse" />
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
      </CardContent>
    </Card>
  );
}
