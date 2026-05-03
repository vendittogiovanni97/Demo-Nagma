"use client";

import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Avatar from '@/components/data-display/Avatar';
import FormInput from '@/components/forms/FormInput';
import SubmitButton from '@/components/forms/SubmitButton';
import type { useProfileForm } from '../hooks/useProfileForm';

type ProfileFormValues = ReturnType<typeof useProfileForm>;

interface SettingsProfileTabProps {
  user: { name?: string; email?: string } | null;
  form: ProfileFormValues;
}

export default function SettingsProfileTab({ user, form }: SettingsProfileTabProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.secondary.main,
        backdropFilter: 'blur(20px)',
        border: 1,
        borderColor: 'divider',
        borderRadius: '30px',
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        maxWidth: 800,
      }}
    >
      {/* Avatar Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          pb: 4,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Avatar name={user?.name} size="lg" color="#4ec9e0" sx={{ transform: 'scale(1.5)' }} />
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700 }}>
            {user?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {user?.email}
          </Typography>
        </Box>
      </Box>

      {/* Update Profile Form */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
            Informazioni Personali
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Aggiorna i tuoi dati
          </Typography>
        </Box>

        <form onSubmit={form.handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormInput
            label="Nome"
            value={form.profileName}
            onChange={form.setProfileName}
            placeholder="Il tuo nome..."
          />
          <FormInput
            label="Telefono"
            type="tel"
            value={form.profilePhone}
            onChange={form.setProfilePhone}
            placeholder="+39 123 456 7890"
          />
          <SubmitButton loading={form.profileLoading} label="Salva Profilo" />
        </form>
      </Box>

      {/* Change Password Section */}
      <Box
        sx={{
          pt: 4,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700 }}>
            Cambia Password
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Aggiorna la tua password di accesso
          </Typography>
        </Box>

        <form onSubmit={form.handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormInput
            label="Password Attuale"
            type="password"
            required
            value={form.currentPassword}
            onChange={form.setCurrentPassword}
            placeholder="••••••••"
          />
          <FormInput
            label="Nuova Password"
            type="password"
            required
            value={form.newPassword}
            onChange={form.setNewPassword}
            placeholder="••••••••"
          />
          <FormInput
            label="Conferma Password"
            type="password"
            required
            value={form.confirmPassword}
            onChange={form.setConfirmPassword}
            placeholder="••••••••"
          />
          <SubmitButton loading={form.passwordLoading} label="Cambia Password" />
        </form>
      </Box>
    </Box>
  );
}
