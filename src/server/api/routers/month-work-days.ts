import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const monthWorkDaySchema = z.object({
  year: z.number().min(1300).max(1500), // Persian year range
  month: z.number().min(1).max(12),
  work_days: z.number().min(0).max(31),
});

export const monthWorkDaysRouter = createTRPCRouter({
  // Get all month work days
  getAll: publicProcedure.query(async () => {
    return await db.monthWorkDay.findMany({
      orderBy: [{ year: "desc" }, { month: "asc" }],
    });
  }),

  // Get work days for a specific month and year
  getByMonthYear: publicProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number(),
      }),
    )
    .query(async ({ input }) => {
      return await db.monthWorkDay.findUnique({
        where: {
          year_month: {
            year: input.year,
            month: input.month,
          },
        },
      });
    }),

  // Create or update month work days
  upsert: publicProcedure
    .input(monthWorkDaySchema)
    .mutation(async ({ input }) => {
      return await db.monthWorkDay.upsert({
        where: {
          year_month: {
            year: input.year,
            month: input.month,
          },
        },
        update: {
          work_days: input.work_days,
          updated_at: new Date(),
        },
        create: {
          year: input.year,
          month: input.month,
          work_days: input.work_days,
        },
      });
    }),

  // Delete month work days
  delete: publicProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      return await db.monthWorkDay.delete({
        where: {
          year_month: {
            year: input.year,
            month: input.month,
          },
        },
      });
    }),

  // Calculate total work days for given months
  getTotalWorkDays: publicProcedure
    .input(
      z.object({
        months: z.array(
          z.object({
            year: z.number(),
            month: z.number(),
          }),
        ),
      }),
    )
    .query(async ({ input }) => {
      if (input.months.length === 0) {
        return { totalWorkDays: 0 };
      }

      const totalWorkDays = await db.monthWorkDay.aggregate({
        where: {
          OR: input.months.map(({ year, month }) => ({
            year,
            month,
          })),
        },
        _sum: {
          work_days: true,
        },
      });

      return {
        totalWorkDays: totalWorkDays._sum.work_days || 0,
      };
    }),
});
