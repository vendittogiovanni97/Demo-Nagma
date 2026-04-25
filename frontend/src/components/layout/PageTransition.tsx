'use client';

import { Box, Fade } from '@mui/material';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <Fade
      key={pathname}
      in={true}
      timeout={{
        enter: 400,
        exit: 400,
      }}
    >
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>
    </Fade>
  );
}
