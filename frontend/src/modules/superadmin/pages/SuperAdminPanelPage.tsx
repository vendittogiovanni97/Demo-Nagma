'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import PageTransition from '@/common/components/layout/PageTransition';
import Button from '@/common/components/ui/Button';
import Icon from '@/common/components/ui/Icon';
import SuperAdminGeneralPanel from '../components/SuperAdminGeneralPanel';

const CustomFieldsManager = dynamic(() => import('../components/CustomFieldsManager'));
const PerformanceDashboard = dynamic(() => import('../components/PerformanceDashboard'));
const ClientSettingsPage = dynamic(() => import('@/modules/admin/pages/ClientSettingsPage'));
const UserSettingsPage = dynamic(() => import('@/modules/user/pages/UserSettingsPage'));

const TABS = [
  { id: 'general', label: 'Impostazioni generali' },
  { id: 'customFields', label: 'Campi personalizzati' },
  { id: 'performance', label: 'Prestazioni e diagnostica' },
  { id: 'clientSettings', label: 'Impostazioni cliente' },
  { id: 'userSettings', label: 'Impostazioni utente' },
] as const;

type TabId = typeof TABS[number]['id'];

function isTabId(value: string | null): value is TabId {
  return TABS.some((tab) => tab.id === value);
}

export default function SuperAdminPanelPage() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const tabParam = searchParams.get('tab');

  useEffect(() => {
    if (isTabId(tabParam)) setActiveTab(tabParam);
  }, [tabParam]);

  const content = activeTab === 'general'
    ? <SuperAdminGeneralPanel />
    : activeTab === 'customFields'
      ? <CustomFieldsManager />
      : activeTab === 'performance'
        ? <PerformanceDashboard />
        : activeTab === 'clientSettings'
          ? <ClientSettingsPage />
          : <UserSettingsPage />;

  return (
    <PageTransition>
      <Box sx={{ pb: 6, pt: 1 }}>
        <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', mb: 4, p: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 56, height: 56, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), border: `2px solid ${alpha(theme.palette.primary.main, 0.4)}` }}>
            <Icon name="shield" size={28} color={theme.palette.primary.main} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 0.5 }}>Pannello di controllo Super Admin</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Configurazione, diagnostica e manutenzione della piattaforma.</Typography>
          </Box>
        </Stack>

        <Stack direction="row" useFlexGap sx={{ gap: 1.5, mb: 4, p: 0.5, borderRadius: 2, border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`, bgcolor: alpha(theme.palette.primary.main, 0.05), width: 'fit-content', maxWidth: '100%', overflowX: 'auto' }}>
          {TABS.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              onClick={() => setActiveTab(tab.id)}
              sx={{ minHeight: 44, whiteSpace: 'nowrap' }}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>

        {content}
      </Box>
    </PageTransition>
  );
}
