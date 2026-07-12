"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import Button from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';

interface ConsentCanvasProps {
  onSignatureChange: (signatureB64: string | null) => void;
}

export default function ConsentCanvas({ onSignatureChange }: ConsentCanvasProps) {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // Initialize Canvas and handle window resize for crisp high-DPI drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas display size (CSS pixels)
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;

    // Scale context to handle device pixel ratio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Set drawing styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = theme.palette.custom.purple;
    ctx.lineWidth = 2.5;
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Check if it's a touch event
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent default scroll behaviors on mobile while drawing
    if (e.cancelable) e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if (e.cancelable) e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Export signature as Base64 image
    const canvas = canvasRef.current;
    if (canvas && !isEmpty) {
      onSignatureChange(canvas.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSignatureChange(null);
  };

  return (
    <Box>
      <Box
        sx={{
          border: '1.5px dashed var(--color-surface-border)',
          borderRadius: '12px',
          backgroundColor: (theme) => theme.palette.background.default,
          position: 'relative',
          height: 180,
          cursor: 'crosshair',
          overflow: 'hidden',
          touchAction: 'none', // Critical: prevents page scroll/zoom while drawing
        }}
      >
        {isEmpty && (
          <Stack
            spacing={1}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              alignItems: 'center',
              color: 'text.secondary',
              pointerEvents: 'none', // Let clicks pass through to the canvas
              userSelect: 'none',
              opacity: 0.5,
            }}
          >
            <Icon name="penTool" size={20} color={theme.palette.custom.purple} />
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
              Firma con il dito o mouse qui dentro
            </Typography>
          </Stack>
        )}

        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </Box>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
        <Typography sx={{ fontSize: '0.7rem', color: isEmpty ? 'text.secondary' : 'custom.emerald', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {!isEmpty && (
            <>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'custom.emerald' }} />
              Firma acquisita con successo
            </>
          )}
        </Typography>
        <Button
          size="sm"
          variant="ghost"
          onClick={clearCanvas}
          disabled={isEmpty}
          icon={<Icon name="rotateCw" size={12} />}
          sx={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            fontWeight: 700,
            borderRadius: '6px',
            border: '1px solid var(--color-surface-border)',
            '&:hover': {
              borderColor: 'var(--color-surface-border)',
              backgroundColor: 'rgba(255,255,255,0.05)',
            },
          }}
        >
          Cancella
        </Button>
      </Stack>
    </Box>
  );
}
