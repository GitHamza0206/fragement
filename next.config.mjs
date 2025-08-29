/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const csp = [
      // Allow this app to be embedded only by itself and localhost during dev
      "frame-ancestors 'self' http://localhost:3000",
      // Allow embedding StackBlitz iframes and related domains
      "frame-src 'self' https://stackblitz.com https://*.stackblitz.com https://*.stackblitz.io https://*.webcontainer.io",
      // Allow StackBlitz scripts and styles
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://stackblitz.com https://*.stackblitz.com",
      "style-src 'self' 'unsafe-inline' https://stackblitz.com https://*.stackblitz.com",
      // Allow StackBlitz to connect to its APIs
      "connect-src 'self' https://stackblitz.com https://*.stackblitz.com https://*.stackblitz.io wss://*.stackblitz.io",
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
