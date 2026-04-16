import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrismaClient = () =>
  new PrismaClient({
    datasources: {
      db: { url: process.env.DATABASE_URL },
    },
  }).$extends(withAccelerate());

declare global {
  // eslint-disable-next-line no-var
  var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

export const db = globalThis.prisma ?? createPrismaClient();

/** Transaction client from `db.$transaction` (matches extended Prisma client). */
export type DbTransactionClient = Parameters<Parameters<typeof db.$transaction>[0]>[0];

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}