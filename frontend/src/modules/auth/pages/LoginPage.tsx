"use client";

import { branding } from '@/common/config/branding';
import { useAuth } from '@/common/context/AuthContext';
import Icon, { Lock, Mail } from '@/common/components/ui/Icon';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import Button from '@/common/components/ui/Button';
import FormInput from '@/common/components/forms/FormInput';
import { useFormModal } from '@/common/hooks/useFormModal';

interface LoginFormData {
  email: string;
  password: string;
}

const LOGIN_INITIAL: LoginFormData = { email: '', password: '' };

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const form = useFormModal<LoginFormData>({
    initial: LOGIN_INITIAL,
    onSubmit: async (data) => {
      await login({ email: data.email, password: data.password });
    },
    onSuccess: () => {
      router.push('/');
    },
    successMessage: 'Accesso effettuato!',
    errorMessage: 'Email o password non validi',
    onClose: () => {},
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(form.formData);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflow: 'hidden', position: 'relative' }}>
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
        <Box sx={{ position: 'absolute', inset: 0, background: (theme) => `linear-gradient(to right, ${alpha(theme.palette.background.default, 0.1)}, ${alpha(theme.palette.background.default, 1)})` }} />
      </Box>

      {/* Right side: Login Form */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 50%', lg: '0 0 45%' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
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
            onSubmit={handleSubmit}
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
              value={form.formData.email}
              onChange={(v: string) => form.setField('email', v)}
              icon={Mail}
              autoComplete="email"
              name="email"
            />

            <FormInput
              type="password"
              placeholder="Password"
              required
              value={form.formData.password}
              onChange={(v: string) => form.setField('password', v)}
              icon={Lock}
              autoComplete="current-password"
              name="password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={form.isLoading}
              isLoading={form.isLoading}
              fullWidth
              loadingLabel="Accesso in corso..."
              sx={{ mt: 1 }}
            >
              Accedi
            </Button>

            {form.error && (
              <Typography variant="body2" sx={{ color: 'error.main', textAlign: 'center', mt: 1 }}>
                {form.error}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}