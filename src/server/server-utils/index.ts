import { Permission } from "~/types";
// csvUtils.js

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
  ignoreKeys = [],
  customFun = undefined,
  customWhere = "",
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
      if (ignoreKeys.includes(key)) continue;
      // const cw = ignoreKey === key && customFun ? customFun : key;
      const condition = `${key} IN (${newValue.join(",")})`;
      if (value.length > 0) conditions.push(condition);
    } else if (value !== undefined && value !== null) {
      const condition = `${key} = '${value}'`;
      conditions.push(condition);
    }
  }
  if ("CityName" in filter)
    return conditions.length > 0
      ? `WHERE ${customWhere}  CityName is not NULL AND ${conditions.join(
          " AND ",
        )}`
      : "";

  if (customWhere)
    return conditions.length > 0
      ? `WHERE ${customWhere} AND ${conditions.join(" AND ")}`
      : "";
  else return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
}

// import { EOL } from "os";
// import { parse } from "@fast-csv/parse";

// export function dataToCsvStream(data: Array<any>, headers: string[]) {
//   const mappedData = data.map((item) => {
//     const keyValuePairs = Object.entries(item);
//     const formattedString = keyValuePairs
//       .map(([key, value]) => `${key},${value}`)
//       .join(",");
//     return formattedString;
//   });
//   const CSV_STRING = mappedData.join(EOL);

//   const stream = parse({ headers })
//     .on("error", (error) => console.error(error))
//     .on("data", (row) => console.log(row))
//     .on("end", (rowCount: number) => console.log(`Parsed ${rowCount} rows`));

//   stream.write(CSV_STRING);
//   stream.end();

//   return stream;
// }
