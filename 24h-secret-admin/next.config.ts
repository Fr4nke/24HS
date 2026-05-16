import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  watchOptions: {
    usePolling: true,
    pollIntervalMs: 1000,
  },
}
export default nextConfig
