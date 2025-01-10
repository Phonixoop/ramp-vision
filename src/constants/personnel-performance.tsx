import {
  ArchiveIcon,
  BiohazardIcon,
  BrainCogIcon,
  FileCheckIcon,
  FileInputIcon,
  FileScanIcon,
  FunctionSquareIcon,
  SyringeIcon,
  ViewIcon,
} from "lucide-react";

export const PersonnelPerformanceTranslate = {
  SabtAvalieAsnad: "ثبت اولیه اسناد",
  PazireshVaSabtAvalieAsnad: "پذیرش و ثبت اولیه اسناد",
  ArzyabiAsanadBimarsetaniDirect: "ارزیابی اسناد بیمارستانی مستقیم",
  ArzyabiAsnadBimarestaniIndirect: "ارزیابی اسناد بیمارستانی غیر مستقیم",
  ArzyabiAsnadDandanVaParaDirect: "ارزیابی اسناد دندان و پارا مستقیم",
  ArzyabiAsnadDandanVaParaIndirect: "ارزیابی اسناد دندان و پارا غیر مستقیم",
  ArzyabiAsnadDaroDirect: "ارزیابی اسناد دارو مستقیم",
  ArzyabiAsnadDaroIndirect: "ارزیابی اسناد دارو غیر مستقیم",
  ArchiveDirectCount: "بایگانی مستقیم",
  ArchiveInDirectCount: "بایگانی غیر مستقیم",
  WithoutScanCount: "ثبت ارزیابی بدون اسکن مدارک",
  WithoutScanInDirectCount: "ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)",
  WithScanCount: "ثبت ارزیابی با اسکن مدارک",

  DirectPerFormance: "عملکرد مستقیم",
  InDirectPerFormance: "عملکرد غیر مستقیم",
  TotalPerformance: "عملکرد کلی",

  TownName: "نام شهر",
  BranchType: "نوع شعبه",
  BranchCode: "کد شعبه",
  BranchName: "نام شعبه",
};

export const PersonnelPerformanceIcons = {
  SabtAvalieAsnad: <FileInputIcon className="stroke-primary" />,
  PazireshVaSabtAvalieAsnad: <FileCheckIcon className="stroke-emerald-500" />,
  ArzyabiAsanadBimarsetaniDirect: <BrainCogIcon className="stroke-amber-500" />,
  ArzyabiAsnadBimarestaniIndirect: (
    <BrainCogIcon className="stroke-amber-700" />
  ),
  ArzyabiAsnadDandanVaParaDirect: <BiohazardIcon className="stroke-rose-500" />,
  ArzyabiAsnadDandanVaParaIndirect: (
    <BiohazardIcon className="stroke-rose-700" />
  ),
  ArzyabiAsnadDaroDirect: <SyringeIcon className="stroke-purple-500" />,
  ArzyabiAsnadDaroIndirect: <SyringeIcon className="stroke-purple-700" />,

  ArchiveDirectCount: <ArchiveIcon className="stroke-violet-500" />,
  ArchiveInDirectCount: <ArchiveIcon className="stroke-violet-900" />,

  WithScanCount: <FileScanIcon className="stroke-cyan-500" />,
  WithoutScanCount: <FileScanIcon className="stroke-cyan-700" />,

  WithoutScanInDirectCount: <FileScanIcon className="stroke-cyan-900" />,

  DirectPerFormance: <FunctionSquareIcon className="stroke-cyan-600" />,
  InDirectPerFormance: <FunctionSquareIcon className="stroke-cyan-600" />,
  TotalPerformance: <FunctionSquareIcon className="stroke-cyan-600" />,
};

export const defualtRoles = [
  "کارشناس ارزیاب اسناد بیمارستانی",
  "کارشناس ارزیاب اسناد پاراکلینیکی",
  "کارشناس ارزیاب اسناد دارویی",
  "کارشناس ارزیاب اسناد دندانپزشکی",
  "کارشناس پذیرش اسناد",
  "کارشناس ثبت اسناد خسارت",
];

export const defualtRoleTypesForPercase = [
  "پیشخوان",
  "نمایندگی",
  "کارگزاری(نمایندگی)",
  "میزخدمت",
  "کارشناس ارزیاب اسناد بیمارستانی",
  "کارشناس ارزیاب اسناد پاراکلینیکی",
  "کارشناس ارزیاب اسناد دارویی",
  "کارشناس ارزیاب اسناد تجهیزات پزشکی",
  "ثبات ارزیابی اسناد بستری غیر مستقیم",
  "ثبات ارزیابی اسناد سرپایی غیر مستقیم",
  "ثبات ارزیابی اسناد ویزیت غیر مستقیم",
  "ثبات ارزیابی اسناد مستقیم",
  "ثبات ارزیابی اسناد ویزیت مستقیم",
];

export const defualtRoleTypesForMoshavere = [
  "میزخدمت",
  "سرپرست",
  "کارشناس ارزیاب اسناد بیمارستانی",
  "کارشناس ارزیاب اسناد پاراکلینیکی",
  "کارشناس ارزیاب اسناد دارویی",
];

export function getDefaultRoleTypesBaseOnContractType(projectType) {
  if (Array.isArray(projectType)) {
    const roleTypes = new Set();

    if (projectType.includes("پرکیس")) {
      defualtRoleTypesForPercase.forEach((roleType) => roleTypes.add(roleType));
    }

    if (projectType.includes("مشاوره")) {
      defualtRoleTypesForMoshavere.forEach((roleType) =>
        roleTypes.add(roleType),
      );
    }

    return Array.from(roleTypes);
  }

  // Fallback for non-array input (if needed)
  switch (projectType) {
    case "پرکیس":
      return defualtRoleTypesForPercase;
    case "مشاوره":
      return defualtRoleTypesForMoshavere;
    default:
      return []; // or some other default value
  }
}

export const defaultProjectTypes = ["ارزیابی"];

export const defualtContractTypes = ["تمام وقت"];

//export const defualtDateInfos = ["1402/09/30"];

export const Indicators = {
  ArzyabiAsanadBimarsetaniDirect: 35, // ارزیابی اسناد بیمارستانی مستقیم
  ArzyabiAsnadDaroDirect: 250, // ارزیابی اسناد دارو مستقیم
  ArzyabiAsnadDandanVaParaDirect: 200, // ارزیابی اسناد دندانپزشکی + پاراکلینیکی مستقیم

  PazireshVaSabtAvalieAsnad: 100, // پذیرش و ثبت اولیه اسناد مستقیم
  // SabtAvalieAsnad : 350, // ثبت اولیه اسناد مستقیم
  SabtAvalieAsnad: 100, // ثبت اولیه اسناد مستقیم

  WithScanCount: 35, // ثبت ارزیابی با اسکن مدارک مستقیم
  WithoutScanCount: 300, // ثبت ارزیابی بدون اسکن مدارک مستقیم

  //InDirect
  WithoutScanInDirectCount: 450, // ثبت ارزیابی بدون اسکن مدارک غیر مستقیم

  ArzyabiAsnadBimarestaniIndirect: 35, // ارزیابی اسناد بیمارستانی غیر مستقیم
  ArzyabiAsnadDaroIndirect: 375, // ارزیابی اسناد دارو  غیر مستقیم
  ArzyabiAsnadDandanVaParaIndirect: 300, // ارزیابی اسناد دندانپزشکی + پاراکلینیکی مستقیم
};

export const performanceLevels = [
  { limit: 75, color: "#B12B1D", text: "ضعیف" },
  { limit: 90, color: "#7BB11B", text: "متوسط" },
  { limit: 120, color: "#7BB11B", text: "خوب" },
  { limit: 180, color: "#16B13D", text: "عالی" },
  { limit: 500, color: "#B1671E", text: "نیاز به بررسی" },
];

export const Performance_Levels_Gauge = [
  ...performanceLevels.map((p) => {
    return {
      limit: p.limit,
      color: p.color,
      tooltip: {
        text: p.text,
      },
    };
  }),
];
