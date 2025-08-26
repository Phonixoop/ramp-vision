import { User } from "@prisma/client";
import { GetServerSidePropsContext } from "next";
import { getToken } from "next-auth/jwt";
import React from "react";
import AdminMainLayout from "~/pages/admin/layout";
import { db } from "~/server/db";
import { Permission } from "~/types";

export default function AdminPage() {
  return <AdminMainLayout></AdminMainLayout>;
}

// export async function getServerSideProps({ req }: GetServerSidePropsContext) {
//   const token = await getToken({ req, secret: process.env.SECRET });
//   const user = token.user as User;
//   const role = await db.role.findFirst({
//     where: {
//       id: user.roleId,
//     },
//   });
//   const permissions: Permission[] = JSON.parse(role.permissions);

//   const permission = permissions.find((p) => p.id === "ViewAdmin");
//   if (!permission || permission?.isActive === false) {
//     return {
//       redirect: {
//         permanent: false,
//         destination: "/",
//       },
//       props: {},
//     };
//   }
//   return {
//     props: {},
//   };
// }
