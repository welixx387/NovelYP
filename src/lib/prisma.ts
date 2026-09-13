import { PrismaClient } from "@prisma/client";

// Стандартный паттерн для Next.js: в dev-режиме модуль перезагружается при каждом
// изменении файла, и без глобального кэша каждый reload открывал бы новое соединение с БД.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
