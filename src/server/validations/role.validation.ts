import { z } from "zod";

let permissionSchema = z.object({
  id: z.string(),
  isActive: z.boolean(),
  enLabel: z.string(),
  faLabel: z.string().nullish(),
});

permissionSchema = permissionSchema.extend({
  subPermissions: permissionSchema.nullish(),
});

export const createRoleSchema = z.object({
  name: z
    .string({ required_error: "این فیلد اجباری است" })
    .min(3, "نام سمت نمیتواند کم تر از 3 حرف باشد "),
  permissions: z.string(),
});

export const updateRoleSchema = z.object({
  id: z.string(),
  name: z
    .string({ required_error: "این فیلد اجباری است" })
    .min(3, "نام سمت نمیتواند کم تر از 3 حرف باشد "),
  permissions: z.string(),
});

export const deleteRoleSchema = z.object({
  id: z.string(),
});
