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
      // (optionnel) si certaines images peuvent aussi venir du staging (uploads proxifiés)
      {
        protocol: 'https',
        hostname: 'staging.miam.tipper.watch',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      
      // (optionnel) ajoute ici d’autres CDN (Cloudinary/S3...) si tu en utilises
      // { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
    // formats: ['image/avif','image/webp'], // optionnel
  },
};


export default nextConfig;
