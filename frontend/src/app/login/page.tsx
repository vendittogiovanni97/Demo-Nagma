"use client";

import { branding } from '@/config/branding';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Typography, useTheme, TextField, InputAdornment, IconButton } from '@mui/material';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Email o password non validi';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: '70vh',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          backgroundColor: 'rgba(26, 35, 50, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.5s ease-out',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'scale(0.95)' },
            to: { opacity: 1, transform: 'scale(1)' },
          },
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            border: 1,
            borderColor: 'divider',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
          }}
        >
          <Image
            src={branding.portalLogo}
            alt={branding.portalName}
            width={40}
            height={40}
            style={{ height: 40, width: 40, objectFit: 'contain' }}
          />
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
          Benvenuto
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {branding.portalName}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 3 }}>
          {branding.portalLoginTagline}
        </Typography>

        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <TextField
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={18} style={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                fontSize: '1rem',
                '& fieldset': { borderColor: theme.palette.divider },
                '&:hover fieldset': { borderColor: theme.palette.primary.main },
                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
              },
              '& .MuiInputBase-input': { color: 'white', py: '14px' },
            }}
          />

          <TextField
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={18} style={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      edge="end"
                      size="small"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                fontSize: '1rem',
                '& fieldset': { borderColor: theme.palette.divider },
                '&:hover fieldset': { borderColor: theme.palette.primary.main },
                '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
              },
              '& .MuiInputBase-input': { color: 'white', py: '14px' },
            }}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            isLoading={loading}
            fullWidth
            loadingLabel="Accesso in corso..."
          >
            Accedi
          </Button>

          {error && (
            <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', mt: 0.5 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}