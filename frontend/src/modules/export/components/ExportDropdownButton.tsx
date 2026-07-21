'use client';

import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Icon from '@/common/components/ui/Icon';
import { ExportFormat } from '../api/exportApi';

interface ExportDropdownButtonProps {
  onExport: (format: ExportFormat) => void;
  onOpenCustomModal?: () => void;
  disabled?: boolean;
}

export function ExportDropdownButton({
  onExport,
  onOpenCustomModal,
  disabled = false,
}: ExportDropdownButtonProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelectFormat = (format: ExportFormat) => {
    handleClose();
    onExport(format);
  };

  const handleCustomClick = () => {
    handleClose();
    if (onOpenCustomModal) {
      onOpenCustomModal();
    }
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        size="small"
        startIcon={<Icon name="download" size={16} />}
        endIcon={<Icon name="chevronDown" size={14} />}
        onClick={handleClick}
        disabled={disabled}
      >
        Esporta
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            elevation: 3,
            sx: { minWidth: 180, mt: 0.5 },
          },
        }}
      >
        <MenuItem onClick={() => handleSelectFormat('csv')}>
          <ListItemIcon>
            <Icon name="fileText" size={16} />
          </ListItemIcon>
          <ListItemText primary="Esporta CSV" secondary="File di testo delimitato" />
        </MenuItem>

        <MenuItem onClick={() => handleSelectFormat('xlsx')}>
          <ListItemIcon>
            <Icon name="fileSpreadsheet" size={16} />
          </ListItemIcon>
          <ListItemText primary="Esporta Excel (.xlsx)" secondary="Con stili e righe colorate" />
        </MenuItem>

        <MenuItem onClick={() => handleSelectFormat('pdf')}>
          <ListItemIcon>
            <Icon name="fileDown" size={16} />
          </ListItemIcon>
          <ListItemText primary="Esporta PDF" secondary="Documento stampabile" />
        </MenuItem>

        {onOpenCustomModal && [
          <Divider key="divider" />,
          <MenuItem key="custom" onClick={handleCustomClick}>
            <ListItemIcon>
              <Icon name="slidersHorizontal" size={16} />
            </ListItemIcon>
            <ListItemText primary="Personalizza..." secondary="Scegli colonne e formato" />
          </MenuItem>,
        ]}
      </Menu>
    </>
  );
}
