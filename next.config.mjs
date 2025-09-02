/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
    images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "1337" },
      { protocol: "https", hostname: "miam.tipper.watch", port: "3001" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};


export default nextConfig;
