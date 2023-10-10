import React, { useState, useEffect } from "react";
import { Permission } from "types";
import { Switch } from "~/components/ui/switch";
import { PERMISSIONS } from "~/constants";

function SubPermissionList({
  subPermissions,
  handlePermissionToggle,
  toggleAll,
}: {
  subPermissions: Permission[];
  handlePermissionToggle: (id: string) => void;
  toggleAll: (subPermissions: Permission[]) => void;
}) {
  const [allChecked, setAllChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);

  useEffect(() => {
    if (subPermissions) {
      const checkedCount = subPermissions.filter(
        (subPermission) => subPermission.isActive,
      ).length;
      setAllChecked(
        checkedCount === subPermissions.length && subPermissions.length > 0,
      );
      setIndeterminate(
        checkedCount > 0 && checkedCount < subPermissions.length,
      );
    }
  }, [subPermissions]);

  return (
    <div className="flex w-full flex-col items-end justify-center rounded-xl bg-secondary/50 p-2 shadow-sm shadow-accent">
      <div
        className="relative flex w-full cursor-pointer items-center justify-end gap-3 rounded-xl px-2 py-4 hover:bg-primbuttn/5"
        onClick={() => {
          toggleAll(subPermissions);
        }}
      >
        <label className="cursor-pointer">تغییر وضعیت همه</label>
        <Switch
          middle={indeterminate}
          checked={allChecked}
          className="bg-accent"
          onCheckedChange={() => {
            toggleAll(subPermissions);
          }}
        />
      </div>
      {subPermissions &&
        subPermissions.map((permission) => (
          <div
            className="relative flex w-full cursor-pointer items-center justify-between rounded-xl px-2 py-4 hover:bg-primbuttn/5"
            onClick={() => handlePermissionToggle(permission.id)}
          >
            <Switch
              id={permission.id}
              className="bg-accent"
              checked={permission.isActive}
              onCheckedChange={() => handlePermissionToggle(permission.id)}
            />

            <label
              className="cursor-pointer"
              onClick={() => handlePermissionToggle(permission.id)}
              htmlFor="id"
            >
              {permission.faLabel}
            </label>
          </div>
        ))}
    </div>
  );
}

const PermissionPanel = () => {
  const [permissions, setPermissions] = useState<Permission[]>(PERMISSIONS);

  function toggleAll(subPermission) {
    const updatedPermissions = subPermission.map((a: Permission) => {
      return (a.isActive = !a.isActive);
    });
    setPermissions((prev) => {
      return prev.map((a: Permission) => {
        if (a.id == subPermission.id) return updatedPermissions;
        return a;
      });
    });
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
    <div className="mx-auto flex max-w-xl flex-col items-end justify-center gap-5 rounded-lg  bg-secbuttn/50 p-8 text-white shadow-lg">
      <h1 className=" text-2xl font-bold">تنظیمات</h1>

      <div className="flex w-full flex-col items-center justify-center gap-2">
        {permissions.map((permission) => (
          <div
            key={permission.id}
            className="flex w-full max-w-lg flex-col items-center justify-center gap-5"
          >
            <div
              className="relative flex w-full cursor-pointer items-center justify-between rounded-xl px-2 py-4 hover:bg-primbuttn/5"
              onClick={() => handlePermissionToggle(permission.id)}
            >
              <Switch
                id={permission.id}
                className="bg-accent"
                checked={permission.isActive}
                onCheckedChange={() => handlePermissionToggle(permission.id)}
              />

              <label
                className="cursor-pointer"
                onClick={() => handlePermissionToggle(permission.id)}
                htmlFor="id"
              >
                {permission.faLabel}
              </label>
            </div>
            {permission.subPermissions &&
              permission.subPermissions.length > 0 &&
              permission.isActive && (
                <div className="w-full px-10 ">
                  <SubPermissionList
                    toggleAll={toggleAll}
                    subPermissions={permission.subPermissions}
                    handlePermissionToggle={handlePermissionToggle}
                  />
                </div>
              )}
          </div>
        ))}
      </div>

      <button className="mt-6 w-full rounded-full bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
        Save Changes
      </button>
      <pre> {JSON.stringify(permissions, null, 2)}</pre>
    </div>
  );
};

export default PermissionPanel;
