import { useFormik } from "formik";
import React, { useEffect, useState } from "react";

import { toFormikValidationSchema } from "zod-formik-adapter";
import { createUserSchema } from "~/server/validations/user.validation";

import TextField from "~/ui/forms/text-field";

import withLabel from "~/ui/forms/with-label";
import Button from "~/ui/buttons";
import PasswordField from "~/ui/forms/password-field";

import { api } from "~/trpc/react";
import InputError from "~/ui/forms/input-error";

import { useUser } from "~/context/user.context";
import { Command } from "~/components/shadcn/command";
import { ComboBox } from "~/features/shadui/ComboBox";
import { reloadSession } from "~/utils/util";
import { User } from "~/types";
import withConfirmation from "~/ui/with-confirmation";
import withModal from "~/ui/modals";
import withModalState from "~/ui/modals/with-modal-state";
import { SquareAsteriskIcon } from "lucide-react";
const TextFieldWithLable = withLabel(TextField);
// const TextAreaWithLable = withLabel(TextAreaField);

function ButtonForChangePasswordModal({ children, ...rest }) {
  return (
    <>
      <Button
        {...rest}
        className="flex min-w-fit items-center justify-center gap-1 bg-secondary px-3 text-primary"
      >
        <SquareAsteriskIcon className="stroke-primary" />
        {children}
      </Button>
    </>
  );
}
const PasswordFieldWithModal = withModalState(ButtonForChangePasswordModal);

export function UserForm({
  onCreateSuccess = (user: User) => {},
  onClearUser = () => {},
  sessionUser,
}: {
  sessionUser?: User | undefined;

  onCreateSuccess?: (user: User) => any;
  onClearUser?: () => any;
}) {
  const getRole = api.role.getAll.useQuery();
  const { selectedRowUser, setSelectedRowUser } = useUser();
  const utils = api.useContext();
  const user = sessionUser ?? selectedRowUser ?? undefined;

  const createUser = api.user.createUser.useMutation({
    async onSuccess(addedUser: User) {
      await utils.user.getUsers.invalidate();
      // Cancel outgoing fetches (so they don't overwrite our optimistic update)
      // await utils.user.getUsers.cancel();
      // utils.user.getUsers.setInfiniteData({ limit: 10 }, (data) => {
      //   console.log({ data });
      //   if (!data) {
      //     return {
      //       pages: [],
      //       pageParams: [],
      //     };
      //   }
      //   return {
      //     ...data,
      //     pages: data.pages.map((page) => ({
      //       ...page,
      //       items: [...page.items, addedUser],
      //     })),
      //   };
      // });
    },

    onSettled() {
      // Sync with server once mutation has settled
      // refetchUsers();
    },
  });

  const updateUser = api.user.updateUser.useMutation({
    onSuccess: async (data) => {
      reloadSession();
      await utils.user.getUsers.invalidate();
    },
  });

  const updateUserPassword = api.user.updateUserPassword.useMutation({
    onSuccess: async (data) => {
      reloadSession();
      await utils.user.getUsers.invalidate();
    },
  });

  const formik = useFormik({
    initialValues: {
      username: selectedRowUser?.username || "",
      // i know its bad to return password from server even hashed password
      password: selectedRowUser?.password || "",
      display_name: selectedRowUser?.display_name || "",
      roleId: selectedRowUser?.roleId || "",
    },

    validationSchema: toFormikValidationSchema(createUserSchema),
    validateOnBlur: true,
    onSubmit: (values: typeof createUserSchema._type) => {
      if (!user)
        return createUser.mutate({
          username: values?.username || "",
          password: values?.password || "",
          display_name: values?.display_name || "",
          roleId: values.roleId,
        });

      return updateUser.mutate({
        id: user.id,
        username: values?.username || "",
        display_name: values?.display_name || "",
        roleId: values.roleId,
      });
    },
  });

  useEffect(() => {
    formik.setValues((a) => {
      return {
        username: selectedRowUser?.username || "",
        password: selectedRowUser?.password || "",
        display_name: selectedRowUser?.display_name || "",
        roleId: selectedRowUser?.roleId || "",
      };
    });
  }, [user, selectedRowUser]);

  return (
    <>
      <form
        onSubmit={(e) => {
          formik.handleSubmit(e);
        }}
        className="relative flex flex-col items-center justify-center gap-8"
      >
        {user && !sessionUser && (
          <Button
            onClick={() => {
              setSelectedRowUser(undefined);
            }}
            className="absolute -top-10  border border-accent/10 bg-secondary text-primbuttn hover:bg-accent hover:text-secbuttn"
          >
            ساخت کاربر جدید +
          </Button>
        )}
        <h3 className="w-full pb-2 text-accent">
          {user ? "ویرایش کاربر" : "ساخت کاربر"}
        </h3>
        <div className="flex w-full items-center justify-between gap-10 text-primary">
          <div className="w-full">
            <TextFieldWithLable
              label={"نام کاربری"}
              name="username"
              id="username"
              {...formik.getFieldProps("username")}
            />
            <InputError message={formik.errors.username} />
          </div>
          {user ? (
            <PasswordFieldWithModal
              content={"تغییر رمز عبور"}
              title="تغییر رمز عبور"
              size={"sm"}
              center
              render={(closeModal) => {
                return (
                  <form
                    className="mx-auto flex w-fit flex-col items-center justify-center gap-5 px-2 py-5"
                    dir="rtl"
                    onSubmit={() => {
                      return updateUserPassword.mutate({
                        id: user.id,
                        password: formik.values.password,
                      });
                    }}
                  >
                    <PasswordFieldView
                      fieldProps={formik.getFieldProps("password")}
                      errors={formik.errors.password}
                    />
                    <div className="flex w-full items-center justify-between gap-4 ">
                      <Button
                        type="submit"
                        isLoading={updateUserPassword.isLoading}
                        className="w-24 bg-emerald-800 text-emerald-200"
                      >
                        ویرایش
                      </Button>
                      <Button
                        onClick={() => closeModal()}
                        className="w-24 border border-primary text-amber-600"
                      >
                        لغو
                      </Button>
                    </div>
                  </form>
                );
              }}
            />
          ) : (
            <PasswordFieldView
              fieldProps={formik.getFieldProps("password")}
              errors={formik.errors.password}
            />
          )}
        </div>

        <div className="w-full">
          <TextFieldWithLable
            label={"نام نمایشی"}
            name="display_name"
            id="display_name"
            {...formik.getFieldProps("display_name")}
            maxLength={100}
          />
          <InputError message={formik.errors.display_name} />
        </div>
        <div className="z-30  flex w-full flex-col items-start justify-start gap-5">
          {getRole.data && (
            <ComboBox
              values={getRole.data.map((role) => {
                return { label: role.name, value: role.id };
              })}
              value={formik.values.roleId}
              onChange={(value) => {
                formik.setValues(() => {
                  return {
                    ...formik.values,
                    roleId: value,
                  };
                });
              }}
              placeHolder="جستجو سمت ها"
            />
          )}
        </div>
        <Button
          disabled={!formik.isValid}
          isLoading={createUser.isLoading || updateUser.isLoading}
          type="submit"
          className="w-full rounded-xl bg-primbuttn text-secondary"
        >
          {user ? "ویرایش" : "ثبت"}
        </Button>
      </form>
    </>
  );
}

export default function MultiSelectBox({
  className = "bg-green-700 text-white shadow-2xl shadow-green-700",
  values = [],
  list = [],
  onChange = (value) => {},
}) {
  const [selectedKeys, setSelectedKeys] = useState(values);
  const isSelected = (key) => selectedKeys.includes(key);

  useEffect(() => {
    onChange(selectedKeys);
  }, [selectedKeys]);
  return (
    <>
      <div className="flex gap-2">
        {list.map((item) => {
          return (
            <span
              className={`${
                isSelected(item.key) ? className : "ring-1 ring-gray-300"
              } w-auto cursor-pointer select-none rounded-full  px-3 py-2 text-primary hover:shadow-md`}
              key={item.key}
              onClick={() => {
                setSelectedKeys((prev) => {
                  return prev.includes(item.key)
                    ? [...prev.filter((i) => i !== item.key)]
                    : [...prev, item.key];
                });
              }}
            >
              {item.value}
            </span>
          );
        })}
      </div>
    </>
  );
}

function PasswordFieldView({ fieldProps, errors }) {
  return (
    <div className="relative w-full">
      <PasswordField
        label={"رمز عبور"}
        name="password"
        id="password"
        type="password"
        {...fieldProps}
      />

      <InputError message={errors} />
    </div>
  );
}
