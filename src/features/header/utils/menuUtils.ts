import { MENU } from "~/constants";

export function checkStatusForMenu(status: string, user: any) {
  if (status === "unauthenticated" || !user) {
    return MENU.filter((menu) => {
      switch (menu.value) {
        case "جزئیات عملکرد شعب":
        case "جزئیات عملکرد پرسنل شعب (جدول)":
        case "جزئیات عملکرد پرسنل شعب (نمودار)":
        case "جزئیات ورودی اسناد مستقیم شعب":
        case "حواله خسارت":
        case "ورودی مستقیم ماهانه":
        case "گیج عملکرد استان ها":
        case "پرسنل":
        case "ارزیابان برتر":
        case "Bi":
          return false;
        default:
          return true;
      }
    });
  }
  return MENU;
}
