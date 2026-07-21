'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { SavedViewData, FilterCondition } from '@/modules/saved-views/api/savedViewApi';
import Icon from '@/common/components/ui/Icon';

interface SavedViewsSelectorProps {
  moduleName: string;
  savedViews: SavedViewData[];
  activeViewId: number | null;
  activeFilters: FilterCondition[];
  onSelectView: (view: SavedViewData | null) => void;
  onSaveNewView: (name: string, isDefault: boolean) => Promise<void>;
  onDeleteView: (id: number) => Promise<void>;
  onSetDefaultView: (id: number) => Promise<void>;
  onOpenFilterBuilder: () => void;
}

export default function SavedViewsSelector({
  savedViews,
  activeViewId,
  activeFilters,
  onSelectView,
  onSaveNewView,
  onDeleteView,
  onSetDefaultView,
  onOpenFilterBuilder,
}: SavedViewsSelectorProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [isDefaultCheckbox, setIsDefaultCheckbox] = useState(false);

  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelect = (view: SavedViewData | null) => {
    onSelectView(view);
    handleCloseMenu();
  };

  const handleOpenSaveModal = () => {
    setNewViewName('');
    setIsDefaultCheckbox(false);
    setSaveModalOpen(true);
    handleCloseMenu();
  };

  const handleConfirmSave = async () => {
    if (!newViewName.trim()) return;
    await onSaveNewView(newViewName.trim(), isDefaultCheckbox);
    setSaveModalOpen(false);
  };

  const activeView = savedViews.find((v) => v.id === activeViewId);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      {/* Dropdown Viste Salvate */}
      <Button
        variant="outlined"
        size="small"
        onClick={handleOpenMenu}
        startIcon={<Icon name="colonne" size={16} />}
        endIcon={<Icon name="freccia-giu" size={14} />}
        sx={{ minHeight: 36, textTransform: 'none', fontWeight: 600 }}
      >
        {activeView ? `Vista: ${activeView.name}` : 'Tutte le Viste'}
      </Button>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 240 } } }}>
        <MenuItem selected={!activeViewId} onClick={() => handleSelect(null)}>
          <Typography variant="body2" sx={{ fontWeight: !activeViewId ? 700 : 400 }}>
            Tutte le Viste (Predefinita)
          </Typography>
        </MenuItem>
        <Divider />

        {savedViews.map((view) => (
          <MenuItem
            key={view.id}
            selected={view.id === activeViewId}
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}
          >
            <Box onClick={() => handleSelect(view)} sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: view.id === activeViewId ? 700 : 400 }}>
                {view.name}
              </Typography>
              {view.isDefault && <Chip size="small" label="Default" color="primary" sx={{ height: 18, fontSize: '0.65rem' }} />}
            </Box>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {!view.isDefault && (
                <IconButton
                  size="small"
                  title="Imposta come predefinita"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefaultView(view.id);
                  }}
                >
                  <Icon name="check" size={14} />
                </IconButton>
              )}
              <IconButton
                size="small"
                color="error"
                title="Elimina vista"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteView(view.id);
                }}
              >
                <Icon name="x" size={14} />
              </IconButton>
            </Box>
          </MenuItem>
        ))}

        <Divider />
        <MenuItem onClick={handleOpenSaveModal} disabled={activeFilters.length === 0}>
          <Typography variant="body2" color="primary" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon name="salva" size={16} /> Salva Filtri Correnti come Vista
          </Typography>
        </MenuItem>
      </Menu>

      {/* Button Builder Filtri */}
      <Button
        variant={activeFilters.length > 0 ? 'contained' : 'outlined'}
        color={activeFilters.length > 0 ? 'primary' : 'inherit'}
        size="small"
        onClick={onOpenFilterBuilder}
        startIcon={<Icon name="filtro" size={16} />}
        sx={{ minHeight: 36, textTransform: 'none', fontWeight: 600 }}
      >
        Filtri Avanzati {activeFilters.length > 0 && `(${activeFilters.length})`}
      </Button>

      {/* Modal Salva Nuova Vista */}
      <Dialog open={saveModalOpen} onClose={() => setSaveModalOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Salva Vista Personalizzata</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Inserisci un nome per la tua configurazione di filtri attivi ({activeFilters.length} filtri).
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Nome Vista"
            value={newViewName}
            onChange={(e) => setNewViewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSaveModalOpen(false)}>Annulla</Button>
          <Button variant="contained" onClick={handleConfirmSave} disabled={!newViewName.trim()}>
            Salva
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
