import {
  BiohazardIcon,
  BrainCogIcon,
  FileCheckIcon,
  FileInputIcon,
  FilePlus2Icon,
  FilePlusIcon,
  FileScanIcon,
  FunctionSquareIcon,
  SyringeIcon,
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
  WithScanCount: "ثبت ارزیابی با اسکن مدارک",
  WithoutScanCount: "ثبت ارزیابی بدون اسکن مدارک",
  WithoutScanInDirectCount: "ثبت ارزیابی بدون اسکن مدارک (غیر مستقیم)",
  TotalPerformance: "عملکرد",
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

  WithScanCount: <FileScanIcon className="stroke-cyan-500" />,
  WithoutScanCount: <FileScanIcon className="stroke-cyan-700" />,

  WithoutScanInDirectCount: <FileScanIcon className="stroke-cyan-900" />,

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

export const defaultProjectTypes = ["ارزیابی"];

export const defualtContractTypes = ["تمام وقت"];

export const defualtDateInfos = ["1402/03/31"];

export const performanceMetrics = [
  {
    limit: 80,
    color: "#B12B1D",
    tooltip: {
      text: "ضعیف",
    },
  },

  {
    limit: 100,
    color: "#7BB11B",
    tooltip: {
      text: "متوسط",
    },
  },
  {
    limit: 150,
    color: "#7BB11B",
    tooltip: {
      text: "خوب",
    },
  },
  {
    limit: 200,
    color: "#16B13D",
    tooltip: {
      text: "عالی",
    },
  },
  {
    limit: 500,
    color: "#B1671E",
    tooltip: {
      text: "نیاز به بررسی",
    },
  },
];
