"use client";

import StatePanel from '@/components/feedback/StatePanel';
import { useAuth } from '@/context/AuthContext';
import { useFormModal } from '@/hooks/useFormModal';
import { useToast } from '@/hooks/useToast';
import { createCustomerSchema } from '@/schemas/customer';
import { customerService } from '@/services/customer.service';
import type { CreateCustomerData, Customer } from '@/types/customer';
import { extractErrorMessage } from '@/utils/extract-error';
import { validateData } from '@/utils/validation';
import { Mail, Phone, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Box, InputAdornment, TextField, Typography, useTheme } from '@mui/material';
import SubmitButton from '@/components/forms/SubmitButton';
import Modal from '@/components/modals/Modal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null;
}

export default function CustomerModal({ isOpen, onClose, onSuccess, customer }: Props) {
  const toast = useToast();
  const { isAdmin } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState<CreateCustomerData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: '',
  });

  const submitCustomer = async (data: CreateCustomerData) => {
    if (customer) {
      await customerService.update(customer.id, data);
    } else {
      await customerService.create(data);
    }
  };

  const { isLoading: loading, handleSubmit: submitForm } = useFormModal<CreateCustomerData>({
    onSubmit: submitCustomer,
    onSuccess,
    onClose,
    successMessage: customer ? 'Cliente aggiornato' : 'Cliente creato',
  });

  useEffect(() => {
    setFormData(
      customer
        ? {
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            email: customer.email ?? '',
            notes: customer.notes ?? '',
          }
        : { firstName: '', lastName: '', phone: '', email: '', notes: '' }
    );
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateData(createCustomerSchema, formData);
    if (validationError) {
      toast.error(extractErrorMessage(new Error(validationError), validationError));
      return;
    }
    await submitForm(formData);
  };

  const fieldLabelSx = {
    px: 0.5,
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.primary.main,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  } as const;

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 1.5,
      fontSize: '0.9375rem',
    },
  } as const;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={customer ? 'Modifica Cliente' : 'Nuovo Cliente'} maxWidth="sm">
      {!isAdmin ? (
        <StatePanel
          variant="error"
          title="Permessi insufficienti"
          description="Solo admin e segreteria possono modificare l'anagrafica clienti."
        />
      ) : (
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography sx={fieldLabelSx}>Nome</Typography>
              <TextField
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Nome"
                size="small"
                fullWidth
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><User size={16} color={theme.palette.text.secondary} /></InputAdornment> } }}
                sx={inputSx}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography sx={fieldLabelSx}>Cognome</Typography>
              <TextField
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Cognome"
                size="small"
                fullWidth
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><User size={16} color={theme.palette.text.secondary} /></InputAdornment> } }}
                sx={inputSx}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={fieldLabelSx}>Telefono</Typography>
            <TextField
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Telefono"
              size="small"
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone size={16} color={theme.palette.text.secondary} /></InputAdornment> } }}
              sx={inputSx}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={fieldLabelSx}>Email</Typography>
            <TextField
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email opzionale"
              size="small"
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Mail size={16} color={theme.palette.text.secondary} /></InputAdornment> } }}
              sx={inputSx}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography sx={fieldLabelSx}>Note</Typography>
            <TextField
              multiline
              minRows={3}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Note, allergie, consensi..."
              fullWidth
              sx={inputSx}
            />
          </Box>

          <SubmitButton
            loading={loading}
            label={customer ? 'Salva Modifiche' : 'Crea Cliente'}
            icon={Save}
          />
        </Box>
      )}
    </Modal>
  );
}
