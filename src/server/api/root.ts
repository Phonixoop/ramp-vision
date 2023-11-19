import { depoRouter } from "~/server/api/routers/depo";
import { exampleRouter } from "~/server/api/routers/example";
import { personnelRouter } from "~/server/api/routers/personnel";
import { personnelPerformanceRouter } from "~/server/api/routers/personnel _performance";
import { roleRouter } from "~/server/api/routers/role";
import { userRouter } from "~/server/api/routers/user";
import { createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  depo: depoRouter,
  personnelPerformance: personnelPerformanceRouter,
  role: roleRouter,
  user: userRouter,
  personnel: personnelRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
