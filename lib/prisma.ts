import { PrismaClient } from "./generated/prisma";

declare global {
  var prisma: PrismaClient | undefined;
}
console.log('je suis dans le prisma');
const prisma = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

export default prisma;
