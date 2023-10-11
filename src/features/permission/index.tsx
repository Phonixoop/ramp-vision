import { ListRestartIcon } from "lucide-react";
import { useState } from "react";
import { Permission } from "~/types";
import { Switch } from "~/components/ui/switch";
import { PERMISSIONS } from "~/constants";
import Button from "~/ui/buttons";

export default function PermissionPanel({
  permissions,
  setPermissions = (permission) => {},
}) {
  if (!Array.isArray(permissions)) return <></>;

  function toggleAll(permission: Permission) {
    const updatedPermissions = permission.subPermissions.map(
      (a: Permission) => {
        return {
          ...a,
          isActive: !a.isActive,
        };
      },
    );

    const newPermissions = permissions.map((a) => {
      if (a.id === permission.id)
        return {
          ...a,
          subPermissions: updatedPermissions,
        };

      return a;
    });

    setPermissions(newPermissions);
  }

  function handlePermissionToggle(id: string) {
    const updatedPermissions = permissions.map((permission) => {
      if (permission.id === id) {
        // Toggle active state of the permission
        return {
          ...permission,
          isActive: !permission.isActive,
          subPermissions: (permission.subPermissions || []).map(
            (subPermission) => ({
              ...subPermission,
              isActive: !permission.isActive, // Toggle sub-permissions as well
            }),
          ),
        };
      } else if (permission.subPermissions) {
        // Check if the id corresponds to a sub-permission
        const updatedSubPermissions = permission.subPermissions.map(
          (subPermission) => {
            if (subPermission.id === id) {
              console.log(id);
              // Toggle active state of the sub-permission
              return { ...subPermission, isActive: !subPermission.isActive };
            } else {
              return subPermission;
            }
          },
        );

        return {
          ...permission,
          subPermissions: updatedSubPermissions,
        };
      } else {
        return permission;
      }
    });

    setPermissions(updatedPermissions);
  }

  return (
    <div className="mx-auto flex w-full flex-col items-end justify-center gap-5  rounded-lg bg-secondary  text-primary sm:p-8 ">
      <h1 className=" text-2xl font-bold">دسترسی ها</h1>

      <div className="flex w-full flex-col items-center justify-center gap-2">
        {permissions.map((permission) => (
          <div
            key={permission.id}
            className="flex w-full  flex-col items-center justify-center gap-5"
          >
            <div
              className="relative flex w-full cursor-pointer items-center justify-between rounded-xl px-2 py-4 hover:bg-primbuttn/5"
              onClick={() => handlePermissionToggle(permission.id)}
            >
              <Switch
                id={permission.id}
                className="bg-accent"
                checked={permission.isActive}
              />
              {permission.isActive ? "active" : "disabled"}
              <label className="cursor-pointer" htmlFor="id">
                {permission.faLabel}
              </label>
            </div>
            {permission.subPermissions &&
              permission.subPermissions.length > 0 &&
              permission.isActive && (
                <div className="max-h-96 w-full overflow-y-auto rounded-2xl px-10 ">
                  <SubPermissionList
                    permission={permission}
                    toggleAll={(permission) => toggleAll(permission)}
                    handlePermissionToggle={(id) => handlePermissionToggle(id)}
                  />
                </div>
              )}
          </div>
        ))}
      </div>

      {/* <pre> {JSON.stringify(permissions, null, 2)}</pre> */}
    </div>
  );
}

function SubPermissionList({
  permission,
  handlePermissionToggle,
  toggleAll,
}: {
  permission: Permission;
  handlePermissionToggle: (id: string) => void;
  toggleAll: (permission: Permission) => void;
}) {
  const subPermissions = permission.subPermissions;
  const checkedCount = subPermissions.filter(
    (subPermission) => subPermission.isActive,
  ).length;
  return (
    <div className="flex w-full  flex-col items-end justify-center rounded-xl bg-secbuttn p-2  ">
      <div
        className="relative flex w-full cursor-pointer items-center justify-end gap-3 rounded-xl px-2 py-4 hover:bg-primbuttn/5"
        onClick={() => {
          toggleAll(permission);
        }}
      >
        <label className="cursor-pointer">
          <ListRestartIcon className="h-6 w-6" />
        </label>
        <Switch
          middle={checkedCount > 0 && checkedCount < subPermissions.length}
          checked={
            checkedCount === subPermissions.length && subPermissions.length > 0
          }
          className="bg-accent"
        />
      </div>
      {subPermissions &&
        subPermissions.map((permission) => (
          <div
            key={permission.id}
            className="relative flex w-full cursor-pointer items-center justify-between rounded-xl px-2 py-4 hover:bg-primbuttn/5"
            onClick={() => handlePermissionToggle(permission.id)}
          >
            <Switch
              id={permission.id}
              className="bg-accent"
              checked={permission.isActive}
            />

            <label className="cursor-pointer" htmlFor="id">
              {permission.faLabel}
            </label>
          </div>
        ))}
    </div>
  );
}
