import {
  BiohazardIcon,
  BrainCogIcon,
  FileCheckIcon,
  FileInputIcon,
  FilePlus2Icon,
  FilePlusIcon,
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
  TotalPerformance: <FunctionSquareIcon className="stroke-cyan-600" />,
};
