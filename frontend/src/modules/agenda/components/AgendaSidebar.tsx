"use client";

import type { Staff } from '@/modules/staff/model/staff.types';
import { Box, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';

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
        width: 180,
        minWidth: 180,
        p: 2,
        borderRight: '1px solid var(--color-surface-border)',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
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
