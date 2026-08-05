import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // Definisce la root del workspace per Turbopack (monorepo con lockfile multipli)
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001'}/api/:path*`,
      },
    ];
  },
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "date-fns",
      "lucide-react",
      "recharts",
      "ag-grid-react",
      "ag-grid-community",
      "@fullcalendar/core",
      "@fullcalendar/react",
      "@fullcalendar/daygrid",
      "@fullcalendar/timegrid",
      "@fullcalendar/interaction",
    ],
  },
};

// Bundle analyzer: attivo SOLO con ANALYZE=true, per non impattare la build
// normale. Richiede il pacchetto (dev): npm i -D @next/bundle-analyzer
//   Uso: ANALYZE=true npm run build   (vedi script "analyze")
let exportedConfig: NextConfig = nextConfig;
if (process.env.ANALYZE === "true") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const withBundleAnalyzer = require("@next/bundle-analyzer")({ enabled: true });
  exportedConfig = withBundleAnalyzer(nextConfig);
}

export default exportedConfig;
