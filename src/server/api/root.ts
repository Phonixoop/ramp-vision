import { biRouter } from "~/server/api/routers/bi";
import { depoRouter } from "~/server/api/routers/depo";
import { exampleRouter } from "~/server/api/routers/example";
import { havaleKhesaratRouter } from "~/server/api/routers/havale_khesarat";
import { homeRouter } from "~/server/api/routers/home";
import { insuranceMetricsRouter } from "~/server/api/routers/insurance_metric";
import { otpUserRouter } from "~/server/api/routers/otpuser";
import { personnelRouter } from "~/server/api/routers/personnel";
import { personnelPerformanceRouter } from "~/server/api/routers/personnel_performance";
import { roleRouter } from "~/server/api/routers/role";
import { userRouter } from "~/server/api/routers/user";

import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
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
  havaleKhesarat: havaleKhesaratRouter,
  insuranceMetrics: insuranceMetricsRouter,
  home: homeRouter,
  otpUser: otpUserRouter,
  bi: biRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
