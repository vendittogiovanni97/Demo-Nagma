"use client";

import FormAutocomplete from '@/common/components/forms/FormAutocomplete';
import FormInput from '@/common/components/forms/FormInput';
import { Box, Grid } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { Booking } from '@/modules/booking/model/booking.types';

interface CustomerSectionProps {
  booking: Booking | null;
  isNewCustomer: boolean;
  customerId: number | string | null;
  customerOptions: Array<{ label: string; value: string | number }>;
  customersLoading: boolean;
  newCustomerFirstName: string;
  newCustomerLastName: string;
  newCustomerPhone: string;
  newCustomerEmail: string;
  onChangeField: (field: any, value: any) => void;
  onCustomerSearchChange?: (term: string) => void;
  onCustomerSelect?: (value: string) => void;
}

export function CustomerSection({
  booking,
  isNewCustomer,
  customerId,
  customerOptions,
  customersLoading,
  newCustomerFirstName,
  newCustomerLastName,
  newCustomerPhone,
  newCustomerEmail,
  onChangeField,
  onCustomerSearchChange,
  onCustomerSelect,
}: CustomerSectionProps) {
  if (booking) {
    return (
      <Grid size={12}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormInput label="Nome" value={booking.customer?.firstName || ''} disabled size="sm" onChange={() => {}} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormInput label="Cognome" value={booking.customer?.lastName || ''} disabled size="sm" onChange={() => {}} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormInput label="Telefono" value={booking.customer?.phone || ''} disabled size="sm" onChange={() => {}} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <FormInput label="Email" value={booking.customer?.email || '—'} disabled size="sm" onChange={() => {}} />
          </Grid>
        </Grid>
      </Grid>
    );
  }

  return (
    <>
      {!isNewCustomer && (
        <Grid size={12}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 5 }}>
              <FormAutocomplete
                label="Cerca Cliente *"
                value={customerId ?? ''}
                onChange={(val) => {
                  onChangeField('customerId', val);
                  onCustomerSelect?.(val);
                }}
                onSearchChange={onCustomerSearchChange}
                disabled={customersLoading}
                loading={customersLoading}
                placeholder="Cerca per nome o telefono..."
                options={customerOptions}
              />
            </Grid>
          </Grid>
        </Grid>
      )}

      {isNewCustomer && (
        <Grid size={12}>
          <Box
            sx={(theme) => ({
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              p: 2,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            })}
          >
            <Grid container spacing={2}>
              <Grid size={3}>
                <FormInput
                  label="Nome *"
                  value={newCustomerFirstName}
                  onChange={(v) => onChangeField('newCustomerFirstName', v)}
                  size="sm"
                  placeholder="Nome"
                />
              </Grid>
              <Grid size={3}>
                <FormInput
                  label="Cognome *"
                  value={newCustomerLastName}
                  onChange={(v) => onChangeField('newCustomerLastName', v)}
                  size="sm"
                  placeholder="Cognome"
                />
              </Grid>
              <Grid size={3}>
                <FormInput
                  label="Telefono *"
                  value={newCustomerPhone}
                  onChange={(v) => onChangeField('newCustomerPhone', v)}
                  size="sm"
                  placeholder="Telefono"
                />
              </Grid>
              <Grid size={3}>
                <FormInput
                  label="Email"
                  value={newCustomerEmail}
                  onChange={(v) => onChangeField('newCustomerEmail', v)}
                  size="sm"
                  type="email"
                  placeholder="Email"
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      )}
    </>
  );
}
