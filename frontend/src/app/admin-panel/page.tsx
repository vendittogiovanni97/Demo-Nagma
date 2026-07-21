import { Suspense } from 'react';
import SuperAdminPanelPage from '@/modules/superadmin/pages/SuperAdminPanelPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SuperAdminPanelPage />
    </Suspense>
  );
}

