import React, { useEffect, useState } from "react";
import { Permission } from "~/types";
import { PERMISSIONS } from "~/constants";
import PermissionPanel from "~/features/permission";
import AdminMainLayout from "~/pages/admin/layout";
import Button from "~/ui/buttons";
import TextField from "~/ui/forms/text-field";
import withLabel from "~/ui/forms/with-label";
import { useFormik } from "formik";
import { Role } from "@prisma/client";
import { createRoleSchema } from "~/server/validations/role.validation";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { api } from "~/utils/api";
import InputError from "~/ui/forms/input-error";
import { cn } from "~/lib/utils";
import { Container } from "~/ui/containers";
import withConfirmation from "~/ui/with-confirmation";
import { toast } from "~/components/ui/toast/use-toast";
import { Trash2Icon } from "lucide-react";
import { updateDynamicPermissions } from "~/utils/util";
const TextWithLabel = withLabel(TextField);
export default function RolesPage() {
  const [role, setRole] = useState<Role>();
  return (
    <AdminMainLayout>
      <Container className="flex flex-col-reverse items-stretch gap-10  py-10 2xl:flex-row ">
        <div className="sticky top-5 h-fit rounded-lg border border-accent/30 bg-secondary p-5 2xl:w-6/12">
          <RoleForm
            selectedRole={role}
            onClear={() => {
              setRole(undefined);
            }}
          />
        </div>
        <RolesList
          onChange={(role) => {
            setRole(role);
          }}
        />
      </Container>
    </AdminMainLayout>
  );
}
const ButtonConfirm = withConfirmation(Button);
export function RolesList({ onChange = (role: Role) => {} }) {
  const roles = api.role.getAll.useQuery();

  return (
    <>
      <div className="flex w-full flex-wrap items-start justify-end gap-5">
        {!roles.isLoading &&
          roles.data.map((r, i) => {
            return (
              <Button
                key={i}
                onClick={() => {
                  onChange(r);
                }}
                className="min-w-[10rem] rounded-xl border border-dashed border-accent/50 bg-secondary p-5 text-center  text-primary"
              >
                {r.name}
              </Button>
            );
          })}
      </div>
    </>
  );
}

export function RoleForm({
  selectedRole = undefined,
  onClear = () => {},
}: {
  selectedRole: Role;
  onClear: () => void;
}) {
  const utils = api.useContext();
  const createRole = api.role.create.useMutation({
    onSuccess: () => {
      utils.role.getAll.invalidate();
    },
  });

  const updateRole = api.role.update.useMutation({
    onSuccess: () => {
      utils.role.getAll.invalidate();
    },
  });

  const deleteRole = api.role.delete.useMutation({
    onSuccess: () => {
      utils.role.getAll.invalidate();
    },
  });

  useEffect(() => {
    formik.setValues(() => {
      return {
        name: selectedRole?.name ?? "",
        permissions: selectedRole
          ? JSON.stringify(
              updateDynamicPermissions(
                PERMISSIONS,
                JSON.parse(selectedRole?.permissions),
              ),
            )
          : JSON.stringify(PERMISSIONS),
      };
    });
  }, [selectedRole]);

  const formik = useFormik({
    initialValues: {
      name: selectedRole?.name ?? "",
      permissions: JSON.stringify(PERMISSIONS),
    },
    validationSchema: toFormikValidationSchema(createRoleSchema),
    validateOnBlur: true,
    onSubmit: (values: typeof createRoleSchema._type) => {
      if (selectedRole) {
        return updateRole.mutate({
          id: selectedRole.id,
          name: values.name,
          permissions: values.permissions,
        });
      } else
        return createRole.mutate({
          name: values.name,
          permissions: values.permissions,
        });
    },
  });

  const hasFormChanged =
    formik.initialValues.name !== formik.values.name ||
    formik.initialValues.permissions !== formik.values.permissions;

  return (
    <form
      className="relative flex  w-full flex-col overflow-hidden pb-10"
      onSubmit={formik.handleSubmit}
    >
      {/* <pre>{JSON.stringify(formik.values)}</pre> */}
      <div
        className=" flex w-full flex-col items-center justify-start gap-5 overflow-y-auto py-5"
        dir="ltr"
      >
        {selectedRole && (
          <>
            <Button
              className="border border-accent "
              isLoading={deleteRole.isLoading}
              onClick={() => onClear()}
            >
              سمت جدید +
            </Button>
          </>
        )}
        <div
          className={cn(
            "flex w-full  items-center",
            selectedRole ? "justify-between" : "justify-end",
          )}
        >
          {selectedRole && (
            <ButtonConfirm
              title={`حذف ${selectedRole.name}`}
              isLoading={deleteRole.isLoading}
              className="flex items-center justify-center gap-2 border border-dashed border-yellow-600 text-amber-500"
              onConfirm={() => {
                deleteRole
                  .mutateAsync({ id: selectedRole.id })
                  .then(() => {
                    onClear();
                  })
                  .catch(() => {
                    toast({
                      title: "خطای پاک کردن سمت",
                      description: deleteRole.error.message,
                    });
                  });
              }}
            >
              <Trash2Icon className="h-5 w-5" />
              <span>پاک کردن</span>
            </ButtonConfirm>
          )}
          <div className="flex flex-col items-end justify-center ">
            <TextWithLabel
              label="نام سمت"
              name="name"
              id="name"
              {...formik.getFieldProps("name")}
            />
            <InputError message={formik.errors.name} />
          </div>
        </div>
        <PermissionPanel
          permissions={JSON.parse(formik.values.permissions)}
          setPermissions={(permissions) => {
            return formik.setFieldValue(
              "permissions",
              JSON.stringify(permissions),
            );
          }}
        />
      </div>

      <Button
        isLoading={createRole.isLoading || updateRole.isLoading}
        className={cn("absolute bottom-0 left-0 w-full  bg-primbuttn")}
        initialtranslateY={hasFormChanged ? -2 : 96}
        translateY={hasFormChanged ? -2 : 96}
        type="submit"
      >
        {selectedRole ? "ویرایش" : "اضافه کردن"}
      </Button>
    </form>
  );
}
