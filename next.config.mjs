/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
      images: {
    // Autorise le domaine source Strapi
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'miam.tipper.watch',
        port: '',
        pathname: '/uploads/**', // ou '/**' si besoin
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
};


export default nextConfig;
