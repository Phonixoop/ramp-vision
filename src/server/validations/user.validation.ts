import { z } from "zod";

export const createUserSchema = z.object({
  username: z
    .string({ required_error: "این فیلد اجباری است" })
    .min(3, "نام کاربری نمی تواند کمتر از 3 حرف باشد"),
  password: z
    .string({ required_error: "این فیلد اجباری است" })
    .min(6, "پسورد نمیتواند کمتر از 6 حرف باشد."),
  city_name: z.string().nullable().optional(),
  roleId: z.string().nullish(),
});

export const updateUserSchema = createUserSchema.extend({ id: z.string() });

export const userIdSchema = z.object({
  id: z.string({ required_error: "این فیلد اجباری است" }),
});

export const userLoginSchema = z.object({
  username: z
    .string({ required_error: "این فیلد اجباری است" })
    .min(3, "نام کاربری نمی تواند کمتر از 3 حرف باشد"),
  password: z
    .string({ required_error: "این فیلد اجباری است" })
    .min(6, "پسورد نمیتواند کمتر از 6 حرف باشد."),
});
