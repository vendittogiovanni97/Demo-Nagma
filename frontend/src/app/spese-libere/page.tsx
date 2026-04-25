"use client";

import { useTheme } from '@mui/material/styles';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { spesaLiberaService } from '@/services/spesa-libera.service';
import Button from '@/components/ui/Button';
import MonthPicker from '@/components/ui/MonthPicker';
import { useToast } from '@/hooks/useToast';
import { useDeleteConfirm } from '@/hooks/useDeleteConfirm';
import type { SpesaLibera } from '@/types/spesa-libera';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { formatPrice } from '@/utils/format';
import { extractErrorMessage } from '@/utils/extract-error';
import { Loader2, Plus, Receipt, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import useSWR from 'swr';
import { mutate } from 'swr';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';

export default function SpeseLiberePage() {
  const theme = useTheme();
  const toast = useToast();
  const { deleteItem, confirmDialogProps } = useDeleteConfirm();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  const monthStr = format(currentDate, 'yyyy-MM');
  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: it });

  const { data: allSpese, isLoading } = useSWR<SpesaLibera[]>(
    ['spese-libere', monthStr],
    () => spesaLiberaService.getAll(monthStr),
    { revalidateOnFocus: false }
  );

  const spese = allSpese?.filter(s => s.createdAt.startsWith(monthStr)) ?? [];

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;
    const parsed = parseFloat(price);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Prezzo non valido');
      return;
    }
    setIsAdding(true);
    try {
      await spesaLiberaService.create({ name: name.trim(), price: parsed });
      await mutate(['spese-libere', monthStr]);
      setName('');
      setPrice('');
      nameRef.current?.focus();
      toast.success('Spesa aggiunta');
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Errore nel salvataggio'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteItem({
      confirmMessage: 'Eliminare questa spesa?',
      action: async () => {
        await spesaLiberaService.delete(id);
        await mutate(['spese-libere', monthStr]);
      },
      successMessage: 'Spesa eliminata',
    });
  };

  const total = spese.reduce((acc, s) => acc + s.price, 0);

  const glassPanelSx = {
    backgroundColor: theme.palette.background.paper,
    backdropFilter: 'blur(20px)',
    border: 1,
    borderColor: 'divider',
    borderRadius: 3,
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
      backgroundColor: 'rgba(0, 191, 255, 0.05)',
      transform: 'translateY(-4px)',
      boxShadow: '0 10px 30px rgba(0, 191, 255, 0.1)',
    },
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: 'md',
        mx: 'auto',
        width: '100%',
        pt: 4,
        px: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              height: 40,
              width: 40,
              borderRadius: 2,
              backgroundColor: 'rgba(0, 191, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Receipt size={22} style={{ color: theme.palette.primary.main }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
              Spese Libere
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Annotazioni rapide di spese
            </Typography>
          </Box>
        </Box>
        <MonthPicker value={currentDate} onChange={setCurrentDate} />
      </Box>

      <Box
        component="form"
        onSubmit={handleAdd}
        sx={{
          ...glassPanelSx,
          p: 2.5,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          '&:hover': {
            transform: 'none',
          },
        }}
      >
        <InputBase
          inputRef={nameRef}
          type="text"
          placeholder="Nome spesa"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          sx={{
            flex: 1,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            px: 2,
            py: 1.5,
            color: theme.palette.text.primary,
            '& .MuiInputBase-input::placeholder': {
              color: theme.palette.text.secondary,
              opacity: 1,
            },
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
            },
            transition: 'border-color 0.2s ease',
          }}
        />
        <InputBase
          type="number"
          placeholder="Prezzo €"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputProps={{ step: '0.01', min: '0' }}
          required
          sx={{
            width: { xs: '100%', sm: 144 },
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            px: 2,
            py: 1.5,
            color: theme.palette.text.primary,
            '& .MuiInputBase-input::placeholder': {
              color: theme.palette.text.secondary,
              opacity: 1,
            },
            '&:focus-within': {
              borderColor: theme.palette.primary.main,
            },
            transition: 'border-color 0.2s ease',
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isAdding || !name.trim() || !price}
          isLoading={isAdding}
          loadingLabel="Aggiungo..."
          icon={isAdding ? undefined : <Plus size={18} />}
        >
          Aggiungi
        </Button>
      </Box>

      <Box sx={{ ...glassPanelSx, overflow: 'hidden', '&:hover': { transform: 'none' } }}>
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              color: theme.palette.text.secondary,
            }}
          >
            <Loader2 size={28} className="animate-spin" style={{ marginRight: 12 }} />
            <span>Caricamento...</span>
          </Box>
        ) : spese.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 8,
              gap: 1.5,
              color: theme.palette.text.secondary,
            }}
          >
            <Receipt size={40} style={{ opacity: 0.3 }} />
            <Typography variant="body2">Nessuna spesa per {monthLabel}</Typography>
          </Box>
        ) : (
          <>
            <Table sx={{ width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Prezzo</TableCell>
                  <TableCell sx={{ width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {spese.map((spesa, idx) => (
                  <TableRow
                    key={spesa.id}
                    sx={{
                      borderBottom: idx === spese.length - 1 ? 0 : 1,
                      borderColor: 'divider',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <TableCell sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                      {spesa.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.875rem',
                      }}
                    >
                      {format(new Date(spesa.createdAt), 'd MMM', { locale: it })}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        fontVariant: 'tabular-nums',
                      }}
                    >
                      {formatPrice(spesa.price)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(spesa.id)}
                        icon={<Trash2 size={16} />}
                        title="Elimina"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 3,
                py: 2,
                borderTop: 1,
                borderColor: 'divider',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}
              >
                Totale {monthLabel}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  fontVariant: 'tabular-nums',
                }}
              >
                {formatPrice(total)}
              </Typography>
            </Box>
          </>
        )}
      </Box>

      <ConfirmDialog {...confirmDialogProps} />
    </Box>
  );
}