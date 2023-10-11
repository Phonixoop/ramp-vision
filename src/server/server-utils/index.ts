import { Permission } from "~/types";

export async function getPermission({ ctx }): Promise<Permission[]> {
  const role = await ctx.db.role.findFirst({
    where: {
      id: ctx.session.user.roleId,
    },
  });
  const permissions: Permission[] = JSON.parse(role.permissions);
  return permissions;
}
