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

export function generateWhereClause(
  filter,
  ignoreKey = undefined,
  customFun = undefined,
) {
  const conditions = [];

  for (const key in filter) {
    const value = filter[key];
    if (Array.isArray(value)) {
      // If the value is an array, create a condition with IN operator
      const newValue = [];
      value.forEach((v) => {
        newValue.push(`N'${v}'`);
      });

      const cw = ignoreKey === key && customFun ? customFun : key;
      const condition = `${cw} IN (${newValue.join(",")})`;
      if (value.length > 0) conditions.push(condition);
    } else if (value !== undefined && value !== null) {
      const condition = `${key} = '${value}'`;
      conditions.push(condition);
    }
  }
  return conditions.length > 0
    ? `WHERE CityName is not NULL AND ${conditions.join(" AND ")}`
    : "";
}
