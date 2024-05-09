/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    assetPrefix: './',
    reactStrictMode: true,
    images: {
        minimumCacheTTL: 60,  
    },
};

module.exports = nextConfig
