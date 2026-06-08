import { runSeed } from "../src/lib/seed-database";
import { prisma } from "../src/lib/prisma";

runSeed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
