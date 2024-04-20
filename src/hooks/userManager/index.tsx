import { useSession } from "next-auth/react";
import React from "react";
import { Permission } from "~/types";

export default function UseUserManager() {
  const session = useSession();

  let hasManagePersonnelAccess = false;

  if (
    session &&
    session.data &&
    session.data.user &&
    session.data.user.role &&
    session.data.user.role.permissions
  ) {
    const userPermissions: Permission[] = JSON.parse(
      session.data.user.role.permissions,
    );
    const managePersonnelPermission = userPermissions.find(
      (p) => p.id === "ManagePersonnel",
    );
    hasManagePersonnelAccess = managePersonnelPermission
      ? managePersonnelPermission.isActive
      : false;
  }

  return { session, hasManagePersonnelAccess };
}
