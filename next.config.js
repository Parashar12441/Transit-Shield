/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/fleet.html', destination: '/fleet', permanent: true },
      { source: '/incidents.html', destination: '/incidents', permanent: true },
      { source: '/routes.html', destination: '/routes', permanent: true },
      { source: '/trips.html', destination: '/trips', permanent: true },
      { source: '/drivers.html', destination: '/drivers', permanent: true },
      { source: '/analytics.html', destination: '/analytics', permanent: true },
      { source: '/incident', destination: '/incidents', permanent: true },
      { source: '/route', destination: '/routes', permanent: true },
      { source: '/trip', destination: '/trips', permanent: true },
      { source: '/driver', destination: '/drivers', permanent: true },
      { source: '/vehicles', destination: '/drivers', permanent: true },
      { source: '/vehicle', destination: '/drivers', permanent: true },
      { source: '/setting', destination: '/settings', permanent: true },
      { source: '/live', destination: '/fleet', permanent: true },
      { source: '/tracking', destination: '/fleet', permanent: true },
    ];
  },
};

module.exports = nextConfig;
