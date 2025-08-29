/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const csp = [
      // Allow this app to be embedded only by itself and localhost during dev
      "frame-ancestors 'self' http://localhost:3000 https://localhost:3000",
      // Allow embedding StackBlitz iframes and related domains (including localhost for dev)
      "frame-src 'self' https://stackblitz.com https://*.stackblitz.com https://*.stackblitz.io https://*.webcontainer.io http://localhost:* https://localhost:*",
      // Allow StackBlitz and Vercel Analytics scripts
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://stackblitz.com https://*.stackblitz.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://stackblitz.com https://*.stackblitz.com",
      // Allow StackBlitz and Vercel connections
      "connect-src 'self' https://stackblitz.com https://*.stackblitz.com https://*.stackblitz.io wss://*.stackblitz.io https://vitals.vercel-analytics.com",
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          // Use CSP frame-ancestors to control who can embed us
          { key: 'Content-Security-Policy', value: csp },
          // Explicitly avoid X-Frame-Options: DENY/SAMEORIGIN; CSP supersedes it
        ],
      },
    ]
  },
}

export default nextConfig
