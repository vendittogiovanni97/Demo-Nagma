"use client";

import { Box, Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';
import type { Staff } from '@/modules/staff/model/staff.types';

interface AgendaSidebarProps {
  onAddEventClick: () => void;
  staffMembers: Staff[];
  selectedStaffIds: number[];
  selectAll: boolean;
  onToggleStaff: (id: number) => void;
  onSelectAll: () => void;
}

export default function AgendaSidebar({
  onAddEventClick,
  staffMembers,
  selectedStaffIds,
  selectAll,
  onToggleStaff,
  onSelectAll,
}: AgendaSidebarProps) {
  return (
    <Box
      sx={{
        width: 280,
        minWidth: 280,
        p: 3,
        borderRight: '1px solid var(--color-surface-border)',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <Button
        variant="contained"
        fullWidth
        sx={{
          mb: 4,
          backgroundColor: '#9155FD',
          color: 'white',
          fontWeight: 600,
          borderRadius: '8px',
          padding: '10px',
          textTransform: 'uppercase',
          boxShadow: '0 4px 14px 0 rgba(145, 85, 253, 0.39)',
          '&:hover': {
            backgroundColor: '#804bdf',
            boxShadow: '0 6px 20px 0 rgba(145, 85, 253, 0.39)',
          },
        }}
        onClick={onAddEventClick}
      >
        Add Event
      </Button>

      <Typography
        variant="caption"
        sx={{
          mb: 2,
          color: 'text.secondary',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}
      >
        CALENDARS
      </Typography>

      <FormGroup sx={{ gap: 1 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={selectAll}
              onChange={onSelectAll}
              sx={{
                color: 'text.secondary',
                '&.Mui-checked': { color: 'text.primary' },
              }}
            />
          }
          label={<Typography sx={{ fontSize: '0.9rem' }}>View All</Typography>}
        />
        {staffMembers.map((staff) => (
          <FormControlLabel
            key={staff.id}
            control={
              <Checkbox
                checked={selectAll || selectedStaffIds.includes(staff.id)}
                onChange={() => onToggleStaff(staff.id)}
                sx={{
                  color: staff.color || '#9155FD',
                  '&.Mui-checked': {
                    color: staff.color || '#9155FD',
                  },
                }}
              />
            }
            label={<Typography sx={{ fontSize: '0.9rem' }}>{staff.name}</Typography>}
          />
        ))}
      </FormGroup>
    </Box>
  );
}
