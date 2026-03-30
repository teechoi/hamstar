/** @type {import('next').NextConfig} */
const nextConfig = {
  // Privy has a CJS/ESM dual-package that confuses Next.js 14's flight loader.
  // serverComponentsExternalPackages keeps it out of the server bundle entirely
  // (Privy is client-side anyway, so 'use client' components are unaffected).
  // Rename to serverExternalPackages when upgrading to Next.js 15.
  experimental: {
    serverComponentsExternalPackages: ['@privy-io/react-auth', '@privy-io/react-auth/solana', '@privy-io/js-sdk-core'],
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '**.imgur.com' },
      // Add other image hosts here as needed
    ],
  },
}

module.exports = nextConfig
