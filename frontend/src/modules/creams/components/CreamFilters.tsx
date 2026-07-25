"use client";

import SmartFilters from '@/common/components/common/SmartFilters';
import type { StaffType } from '@/common/shared/types/enums';

interface StaffMember {
  id: number;
  name: string;
  type: StaffType;
  color?: string;
}

interface CreamFiltersProps {
  monthLabel: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
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
  monthLabel,
  onPrevMonth,
  onNextMonth,
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
      monthPicker={{
        label: monthLabel,
        onPrev: onPrevMonth,
        onNext: onNextMonth,
      }}
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
