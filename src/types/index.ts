import { Role, User as PrismaUser } from "@prisma/client";

export type TremorColor =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose";

export type Permission = {
  id: string;
  isActive: boolean;
  enLabel: string;
  faLabel: string;
  subPermissions?: Permission[];
};

export type User = PrismaUser & { role?: Role };

export type CityWithPerformanceData = {
  CityName_En: string;
  CityName_Fa: string;
  TotalPerformance: number;
};

export type TableJson = {
  title: string;
  table: { [key: string]: string[] };
};
