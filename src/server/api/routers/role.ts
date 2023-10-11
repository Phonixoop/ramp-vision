import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import {
  createRoleSchema,
  deleteRoleSchema,
  updateRoleSchema,
} from "~/server/validations/role.validation";

export const roleRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createRoleSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.role.create({
        data: {
          name: input.name,
          permissions: input.permissions,
        },
      });
    }),
  update: protectedProcedure
    .input(updateRoleSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.role.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          permissions: input.permissions,
        },
      });
    }),
  delete: protectedProcedure
    .input(deleteRoleSchema)
    .mutation(({ ctx, input }) => {
      return ctx.db.role.delete({
        where: {
          id: input.id,
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.role.findMany();
  }),
});
