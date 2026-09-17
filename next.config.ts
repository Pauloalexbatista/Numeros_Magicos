import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // TypeScript is strictly checked locally via tsc before pushing.
    // Disabling redundant in-build typecheck saves ~1.5GB RAM and prevents Docker build OOM on VPS.
    ignoreBuildErrors: true,
  },
  // Ensure smooth builds in containerized environments
  serverExternalPackages: ['@prisma/client', 'prisma'],
  staticPageGenerationTimeout: 180,
};

export default withNextIntl(nextConfig);
