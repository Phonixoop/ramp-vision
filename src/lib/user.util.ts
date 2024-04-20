import { PERMISSIONS } from "~/constants";
import { Permission } from "~/types";

// Define the type for user permissions with specific keys
export type UserPermissions = {
  ViewAdmin: boolean;
  ViewDashboard: boolean;
  ManageUsers: boolean;
  ManagePersonnel: boolean;
  ViewCities: boolean;

  // SubPermissions
  ViewCharts: boolean;
  ViewTable: boolean;

  // Additional dynamic keys
  [key: string]: boolean;
};

export function getUserPermissions(
  userPermissions: Permission[],
): UserPermissions {
  const permissions: UserPermissions = {
    ViewAdmin: false,
    ViewDashboard: false,
    ManageUsers: false,
    ManagePersonnel: false,
    ViewCities: false,
    ViewCharts: false,
    ViewTable: false,
  };

  // Function to recursively check permissions
  const checkPermissions = (permissionsArray: Permission[]) => {
    permissionsArray.forEach((permission) => {
      permissions[permission.id] = permission.isActive;

      if (permission.subPermissions) {
        checkPermissions(permission.subPermissions);
      }
    });
  };

  // Start checking permissions recursively for each permission in the userPermissions array
  userPermissions.forEach((permission) => {
    checkPermissions([permission]);
  });

  return permissions;
}
