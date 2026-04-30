"use client";

import { branding } from '@/config/branding';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import Button from '@/components/ui/Button';
import FormInput from '@/components/forms/FormInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      {/* Left side: Image */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          flex: 1,
          backgroundImage: 'url(/image1.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10, 26, 38, 0.1), rgba(10, 26, 38, 1))' }} />
      </Box>

      {/* Right side: Login Form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 50%', lg: '0 0 45%' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(10, 26, 38, 1)',
          p: { xs: 3, sm: 6 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            animation: 'fadeIn 0.6s ease-out',
            '@keyframes fadeIn': {
              from: { opacity: 0, transform: 'translateY(20px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4,
              border: 1,
              borderColor: 'rgba(0, 191, 255, 0.15)',
              boxShadow: '0 10px 30px -5px rgba(0, 191, 255, 0.15)',
              overflow: 'hidden',
            }}
          >
            <Image
              src={branding.portalLogo}
              alt={branding.portalName}
              width={48}
              height={48}
              priority
              style={{ height: 48, width: 48, objectFit: 'contain' }}
            />
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 800, color: 'white', mb: 1, fontFamily: 'Outfit, sans-serif' }}>
            Benvenuto
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 0.5 }}>
            {branding.portalName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 6, textAlign: 'center' }}>
            {branding.portalLoginTagline}
          </Typography>

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              mt: 2,
            }}
          >
            <FormInput
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={setEmail}
              icon={Mail}
              autoComplete="email"
            />

            <FormInput
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={setPassword}
              icon={Lock}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              isLoading={loading}
              fullWidth
              loadingLabel="Accesso in corso..."
              sx={{ mt: 1 }}
            >
              Accedi
            </Button>

            {error && (
              <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}