import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    provider: "postgresql",
    url: process.env.DATABASE_URL || "postgresql://root:root123@localhost:5432/nagmadb_?schema=public",
  },
});
