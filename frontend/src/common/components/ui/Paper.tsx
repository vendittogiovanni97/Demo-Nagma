'use client';
import { Paper as MuiPaper, type PaperProps as MuiPaperProps } from '@mui/material';
import { forwardRef } from 'react';

interface PaperProps extends MuiPaperProps {}

const Paper = forwardRef<HTMLDivElement, PaperProps>(({ sx, children, ...props }, ref) => (
  <MuiPaper ref={ref} sx={{ bgcolor: 'background.paper', borderRadius: 2, ...sx }} {...props}>
    {children}
  </MuiPaper>
));
Paper.displayName = 'Paper';
export default Paper;
