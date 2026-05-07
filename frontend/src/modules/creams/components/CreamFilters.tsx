"use client";

import SmartFilters from '@/components/common/SmartFilters';

interface StaffMember {
  id: number;
  name: string;
  type: 'COLLABORATORE' | 'APPRENDISTA';
  color?: string;
}

interface CreamFiltersProps {
  startDate: string;
  onStartDateChange: (v: string) => void;
  endDate: string;
  onEndDateChange: (v: string) => void;
  artistFilter: number | '';
  onArtistFilterChange: (v: number | '') => void;
  teamMembers: StaffMember[];
  onFilterSubmit: () => void;
}

export default function CreamFilters({
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  artistFilter,
  onArtistFilterChange,
  teamMembers,
  onFilterSubmit,
}: CreamFiltersProps) {
  return (
    <SmartFilters
      dateRange={{
        start: { value: startDate, onChange: onStartDateChange },
        end: { value: endDate, onChange: onEndDateChange },
      }}
      select={{
        label: "Artista",
        value: artistFilter.toString(),
        onChange: (value) => onArtistFilterChange(value === '' ? '' : Number(value)),
        placeholder: "Tutti gli artisti",
        options: (teamMembers ?? []).map((member) => ({
          label: `${member.name} (${member.type === 'APPRENDISTA' ? 'Appr.' : 'Coll.'})`,
          value: member.id.toString(),
        })),
      }}
      submitAction={{
        label: "Filtra",
        onClick: onFilterSubmit,
      }}
    />
  );
}
