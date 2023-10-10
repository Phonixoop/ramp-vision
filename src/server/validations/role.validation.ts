import { z } from "zod";

export const createRoleSchema = z.object({
  name: z
    .string({ required_error: "این فیلد اجباری است" })
    .min(3, "نام نقش نمیتواند کم تر از 3 حرف باشد "),
  permissions: z
    .string({ required_error: "این فیلد اجباری است" })
    .min(6, "پسورد نمیتواند کمتر از 6 حرف باشد."),
  roleId: z.string().nullish(),
});
