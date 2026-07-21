import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // Definisce la root del workspace per Turbopack (monorepo con lockfile multipli)
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  // bundle-barrel-imports (CRITICAL): Next.js 13.5+ transforms barrel imports
  // to direct imports at build time — no code changes needed.
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "date-fns",
      "lucide-react",
      "@fullcalendar/core",
      "@fullcalendar/react",
      "@fullcalendar/daygrid",
      "@fullcalendar/timegrid",
      "@fullcalendar/interaction",
    ],
  },
};

export default nextConfig;
