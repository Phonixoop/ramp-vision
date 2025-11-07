import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import {
  createUserSchema,
  updateUserPassword,
  updateUserSchema,
  userIdSchema,
} from "~/server/validations/user.validation";
import { hashPassword } from "~/utils/util";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure.query(({ ctx }) => {
    return ctx.session.user;
  }),

  createUser: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ input, ctx }) => {
      const created = await ctx.db.user.create({
        data: {
          username: input.username,
          password: hashPassword(input.password),
          roleId: input.roleId,
        },
        select: {
          id: true,
          username: true,
          display_name: true,
          roleId: true,
          created_at: true,
          updated_at: true,
          role: true,
        },
      });
      return created;
    }),
  updateUser: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ input, ctx }) => {
      const updated = await ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          username: input.username,
          roleId: input.roleId,
          display_name: input.display_name,
        },
        select: {
          id: true,
          username: true,
          display_name: true,
          roleId: true,
          created_at: true,
          updated_at: true,
          role: true,
        },
      });
      return updated;
    }),
  updateUserPassword: protectedProcedure
    .input(updateUserPassword)
    .mutation(async ({ input, ctx }) => {
      const updated = await ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          password: hashPassword(input.password),
        },
        select: {
          id: true,
          username: true,
          display_name: true,
          roleId: true,
          created_at: true,
          updated_at: true,
          role: true,
        },
      });
      return updated;
    }),
  getUsers: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish().default(10),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const items =
        (await ctx.db.user.findMany({
          take: limit + 1, // get an extra item at the end which we'll use as next cursor
          cursor: cursor ? { id: cursor } : undefined,
          select: {
            id: true,
            username: true,
            display_name: true,
            roleId: true,
            created_at: true,
            updated_at: true,
            role: true,
          },
          orderBy: {
            created_at: "desc",
          },
        })) || [];
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
  getUserById: protectedProcedure
    .input(userIdSchema)
    .query(async ({ input, ctx }) => {
      return await ctx.db.user.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          username: true,
          display_name: true,
          roleId: true,
          created_at: true,
          updated_at: true,
          role: true,
        },
      });
    }),
  deleteUser: protectedProcedure
    .input(userIdSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.user.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
