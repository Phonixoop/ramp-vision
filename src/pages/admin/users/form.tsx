// import { useFormik } from "formik";
// import React, { useEffect, useState } from "react";

// import { toFormikValidationSchema } from "zod-formik-adapter";
// import { createUserSchema } from "~/server/validations/user.validation";

// import TextField from "~/ui/forms/text-field";

// import withLabel from "~/ui/forms/with-label";
// import Button from "~/ui/buttons";
// import PasswordField from "~/ui/forms/password-field";

// import { api } from "~/utils/api";
// import InputError from "~/ui/forms/input-error";
// import { ROLES } from "~/server/constants";
// import { User } from "~/types";
// import { useUser } from "~/context/user.context";
// import { Command } from "~/components/ui/command";
// import { ComboBox } from "~/features/shadui/ComboBox";
// import { reloadSession } from "~/utils/util";

// const TextFieldWithLable = withLabel(TextField);
// // const TextAreaWithLable = withLabel(TextAreaField);

// export function UserForm({
//   onCreateSuccess = (user: User) => {},
//   onClearUser = () => {},
//   sessionUser,
// }: {
//   sessionUser?: User | undefined;

//   onCreateSuccess?: (user: User) => any;
//   onClearUser?: () => any;
// }) {
//   const getCompany = api.company.getAll.useQuery();
//   const { selectedRowUser, setSelectedRowUser } = useUser();
//   const utils = api.useContext();
//   const user = sessionUser ?? selectedRowUser ?? undefined;
//   console.log({ user });
//   const createUser = api.user.createUser.useMutation({
//     async onSuccess(addedUser: User) {
//       await utils.user.getUsers.invalidate();
//       // Cancel outgoing fetches (so they don't overwrite our optimistic update)
//       // await utils.user.getUsers.cancel();
//       // utils.user.getUsers.setInfiniteData({ limit: 10 }, (data) => {
//       //   console.log({ data });
//       //   if (!data) {
//       //     return {
//       //       pages: [],
//       //       pageParams: [],
//       //     };
//       //   }
//       //   return {
//       //     ...data,
//       //     pages: data.pages.map((page) => ({
//       //       ...page,
//       //       items: [...page.items, addedUser],
//       //     })),
//       //   };
//       // });
//     },

//     onSettled() {
//       // Sync with server once mutation has settled
//       // refetchUsers();
//     },
//   });

//   const updateUser = api.user.updateUser.useMutation({
//     onSuccess: async (data) => {
//       reloadSession();
//       await utils.user.getUsers.invalidate();
//     },
//   });

//   const formik = useFormik({
//     initialValues: {
//       name: user?.name || "",
//       email: user?.email || "",
//       username: user?.username || "",
//       password: user?.password || "",
//       description: user?.description || "",
//       role: user?.role || "USER",
//       companyId: user?.companyId,
//     },

//     validationSchema: toFormikValidationSchema(createUserSchema),
//     validateOnBlur: true,
//     onSubmit: (values: typeof createUserSchema._type) => {
//       if (!user)
//         return createUser.mutate({
//           name: values.name,
//           username: values.username,
//           password: values.password,
//           email: values.email,
//           description: values.description,
//           role: values.role || "USER",
//           companyId: values.companyId,
//         });

//       return updateUser.mutate({
//         id: user.id,
//         name: values.name,
//         username: values.username,
//         password: values.password,
//         email: values.email,
//         description: values.description,
//         role: values.role || "USER",
//         companyId: values.companyId,
//       });
//     },
//   });

//   useEffect(() => {
//     formik.setValues((a) => {
//       return {
//         name: user?.name || "",
//         email: user?.email || "",
//         username: user?.username || "",
//         password: user?.password || "",
//         description: user?.description || "",
//         role: user?.role || "USER",
//         companyId: user?.companyId,
//       };
//     });
//   }, [user, selectedRowUser]);

//   return (
//     <>
//       <form
//         onSubmit={(e) => {
//           formik.handleSubmit(e);
//         }}
//         className="relative flex flex-col items-center justify-center gap-8"
//       >
//         {user && !sessionUser && (
//           <Button
//             onClick={() => {
//               setSelectedRowUser(undefined);
//             }}
//             className="absolute -top-10  border border-accent/10 bg-secondary text-primbuttn hover:bg-accent hover:text-secbuttn"
//           >
//             ساخت کاربر جدید +
//           </Button>
//         )}
//         <h3 className="w-full pb-2 text-accent">
//           {user ? "ویرایش کاربر" : "ساخت کاربر"}
//         </h3>
//         <div className="w-full ">
//           <TextFieldWithLable
//             label={"نام"}
//             name="name"
//             id="name"
//             {...formik.getFieldProps("name")}
//           />
//           <InputError message={formik.errors.name} />
//         </div>
//         <div className="flex items-center justify-center gap-10 text-primary">
//           <div>
//             <TextFieldWithLable
//               label={"نام کاربری"}
//               name="username"
//               id="username"
//               {...formik.getFieldProps("username")}
//             />
//             <InputError message={formik.errors.username} />
//           </div>
//           <div className="relative">
//             <PasswordField
//               label={"رمز عبور"}
//               name="password"
//               id="password"
//               type="password"
//               {...formik.getFieldProps("password")}
//             />

//             <InputError message={formik.errors.password} />
//           </div>
//         </div>

//         <div className="w-full">
//           <TextFieldWithLable
//             label={"ایمیل"}
//             name="email"
//             id="email"
//             {...formik.getFieldProps("email")}
//           />
//           <InputError message={formik.errors.email} />
//         </div>
//         <div className="w-full">
//           <TextFieldWithLable
//             label={"توضیحات"}
//             name="description"
//             id="description"
//             {...formik.getFieldProps("description")}
//             maxLength={100}
//           />
//           <InputError message={formik.errors.description} />
//         </div>
//         <div className="z-30  flex w-full flex-col items-start justify-start gap-5">
//           {getCompany.data && (
//             <ComboBox
//               values={getCompany.data.map((company) => {
//                 return { label: company.name, value: company.id };
//               })}
//               value={formik.values.companyId}
//               onChange={(value) => {
//                 formik.setValues(() => {
//                   return {
//                     ...formik.values,
//                     companyId: value,
//                   };
//                 });
//               }}
//               placeHolder="جستجو شرکت ها"
//             />
//           )}
//         </div>

//         <div className="z-30  flex w-full flex-col items-start justify-start gap-5">
//           <ComboBox
//             values={ROLES.map((role) => {
//               return { label: role.value.name, value: role.value.key };
//             })}
//             value={formik.values.role}
//             onChange={(value) => {
//               formik.setValues(() => {
//                 return {
//                   ...formik.values,
//                   role: value,
//                 };
//               });
//             }}
//             placeHolder="جستجو نقش ها"
//           />
//         </div>

//         <Button
//           disabled={createUser.isLoading || !formik.isValid}
//           isLoading={createUser.isLoading || updateUser.isLoading}
//           type="submit"
//           className="w-full rounded-xl bg-primbuttn text-secondary"
//         >
//           {user ? "ویرایش" : "ثبت"}
//         </Button>
//       </form>
//     </>
//   );
// }

// export default function MultiSelectBox({
//   className = "bg-green-700 text-white shadow-2xl shadow-green-700",
//   values = [],
//   list = [],
//   onChange = (value) => {},
// }) {
//   const [selectedKeys, setSelectedKeys] = useState(values);
//   const isSelected = (key) => selectedKeys.includes(key);

//   useEffect(() => {
//     onChange(selectedKeys);
//   }, [selectedKeys]);
//   return (
//     <>
//       <div className="flex gap-2">
//         {list.map((item) => {
//           return (
//             <span
//               className={`${
//                 isSelected(item.key) ? className : "ring-1 ring-gray-300"
//               } w-auto cursor-pointer select-none rounded-full  px-3 py-2 text-primary hover:shadow-md`}
//               key={item.key}
//               onClick={() => {
//                 setSelectedKeys((prev) => {
//                   return prev.includes(item.key)
//                     ? [...prev.filter((i) => i !== item.key)]
//                     : [...prev, item.key];
//                 });
//               }}
//             >
//               {item.value}
//             </span>
//           );
//         })}
//       </div>
//     </>
//   );
// }
