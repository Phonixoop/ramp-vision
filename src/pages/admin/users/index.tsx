import React, { useState } from "react";
import AdminMainLayout from "~/pages/admin/layout";

import { Container, ContainerBottomBorder } from "~/ui/containers";

// import { UserForm } from "~/pages/admin/users/form";
// import UsersList from "~/pages/admin/users/users-list";
// import { User } from "~/types";
import { UserProvider, useUser } from "~/context/user.context";
import { PERMISSIONS } from "~/constants";

export default function UsersPage() {
  return (
    <AdminMainLayout>
      <Container className="flex flex-col-reverse items-stretch gap-10 py-10  2xl:flex-row ">
        <UserProvider>
          <div className="sticky top-5 h-fit rounded-lg p-5 2xl:w-6/12">
            {/* <UserForm /> */}
            <PermissionPanel />
          </div>
          <div className=" h-fit max-h-[42rem] w-full overflow-hidden overflow-y-auto rounded-lg  border border-accent/30 bg-secondary  2xl:w-7/12 2xl:p-5">
            {/* <UsersList /> */}
          </div>
        </UserProvider>
      </Container>
    </AdminMainLayout>
  );
}

const SubPermissionList = ({ subPermissions, handlePermissionToggle }) => {
  return (
    <ul className="mb-2 ml-6">
      {subPermissions.map((subPermission) => (
        <li key={subPermission.id} className="flex items-center">
          <input
            type="checkbox"
            checked={subPermission.isActive}
            onChange={() => handlePermissionToggle(subPermission.id)}
            className="form-checkbox mr-2"
          />
          <label>{subPermission.enLabel}</label>
          {subPermission.subPermissions &&
            subPermission.subPermissions.length > 0 &&
            subPermission.isActive && (
              <SubPermissionList
                subPermissions={subPermission.subPermissions}
                handlePermissionToggle={handlePermissionToggle}
              />
            )}
        </li>
      ))}
    </ul>
  );
};

const PermissionPanel = () => {
  const [permissions, setPermissions] = useState(PERMISSIONS);

  const handlePermissionToggle = (enLabel) => {
    const updatedPermissions = permissions.map((permission) => {
      if (permission.enLabel === enLabel) {
        return { ...permission, isActive: !permission.isActive };
      } else if (
        permission.subPermissions &&
        permission.subPermissions.length > 0
      ) {
        return {
          ...permission,
          subPermissions: permission.subPermissions.map((subPermission) => {
            if (subPermission.enLabel === enLabel) {
              return { ...subPermission, isActive: !subPermission.isActive };
            } else {
              return subPermission;
            }
          }),
        };
      } else {
        return permission;
      }
    });
    setPermissions(updatedPermissions);
  };

  return (
    <div className="mx-auto max-w-xl rounded-lg bg-gray-900 p-8 text-white shadow-lg">
      <h1 className="mb-4 text-2xl font-bold">Permission Settings</h1>

      <div className="space-y-4">
        {permissions.map((permission) => (
          <div key={permission.enLabel} className="flex flex-col">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={permission.isActive}
                onChange={() => handlePermissionToggle(permission.enLabel)}
                className="form-checkbox text-blue-500"
              />
              <label className="ml-2">{permission.enLabel}</label>
            </div>
            {permission.subPermissions &&
              permission.subPermissions.length > 0 &&
              permission.isActive && (
                <SubPermissionList
                  subPermissions={permission.subPermissions}
                  handlePermissionToggle={handlePermissionToggle}
                />
              )}
          </div>
        ))}
      </div>

      <button className="mt-6 w-full rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
        Save Changes
      </button>
    </div>
  );
};
