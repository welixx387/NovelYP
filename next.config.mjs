/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Обложки — локальные векторные SVG (см. prisma/seed.mjs). Раст-оптимизатор Next.js
    // не умеет их пережимать (и не нужен для уже маленьких vector-файлов), поэтому
    // изображения отдаются как есть, без прогонки через /_next/image.
    unoptimized: true,
  },
};

export default nextConfig;
