/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const csp = [
      // Allow this app to be embedded only by itself and localhost during dev
      "frame-ancestors 'self' http://localhost:3000",
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
