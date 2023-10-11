import { depoRouter } from "~/server/api/routers/depo";
import { exampleRouter } from "~/server/api/routers/example";
import { roleRouter } from "~/server/api/routers/role";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  depo: depoRouter,
  role: roleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
