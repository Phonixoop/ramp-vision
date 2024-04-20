import moment from "jalali-moment";
import { Permission } from "~/types";

export const MENU = [
  {
    value: "خانه",
    link: "/",
  },
  {
    value: "راهنما",
    link: "/guide",
  },
  {
    value: "درباره RAMP",
    link: "/about",
  },
  {
    value: "جزئیات عملکرد شعب",
    link: "/dashboard/depo",
  },
  {
    value: "جزئیات عملکرد پرسنل شعب (جدول)",
    link: "/dashboard/personnel_performance",
    subMenu: [
      {
        value: "جزئیات عملکرد پرسنل شعب",
        link: "/dashboard/personnel_performance/cities",
      },
    ],
  },

  {
    value: "گیج عملکرد استان ها",
    link: "/dashboard/gauges",
  },
  {
    value: "پرسنل",
    link: "/dashboard/personnels",
  },
];

// export const Reports_Period = ["روزانه", "هفتگی", "ماهانه"];

export const Reports_Period = {
  روزانه: "روز",
  هفتگی: "هفته",
  ماهانه: "ماه",
};
export const City_Levels: {
  name: string;
  cities: string[];
}[] = [
  {
    name: "ممتاز",
    cities: [
      "Tehran InDirect",
      "Tehran Direct",
      "Isfahan",
      "Fars",
      "East Azerbaijan",
      "Khorasan, Razavi",
      "Khuzestan",
      "Mazandaran",
      "Gilan",
    ],
  },
  {
    name: "درجه یک",
    cities: [
      "Alborz",
      "Ardabil",
      "Bushehr",
      "Golestan Province",
      "Ilam",
      "Kerman",
      "Kermanshah",
      "Kohgiluyeh and Boyer-Ahmad",
      "Lorestan",
      "Markazi",
      "Qom",
      "West Azerbaijan",
      "Yazd",
    ],
  },
  {
    name: "درجه دو",
    cities: [
      "Chahar Mahaal and Bakhtiari",
      ,
      "Khorasan, North",
      "Khorasan, South",
      "Kurdistan",
      "Qazvin",
      "Semnan",
      "Sistan and Baluchestan",
      "Hormozgan",
      "Zanjan",
    ],
  },
];

export const CITIES: City[] = [
  { EnglishName: "Tehran InDirect", PersianName: "تهران غیر مستقیم" },
  { EnglishName: "Tehran Direct", PersianName: "تهران مستقیم" },
  // { EnglishName: "Tehran Jobran", PersianName: "تهران جبران" },
  // { EnglishName: "Tehran Not Jobran", PersianName: "تهران غیر جبران" },
  // { EnglishName: "Tehran", PersianName: "تهران" },
  { EnglishName: "Ardabil", PersianName: "اردبیل" },
  { EnglishName: "Isfahan", PersianName: "اصفهان" },
  { EnglishName: "Alborz", PersianName: "البرز" },
  { EnglishName: "Ilam", PersianName: "ایلام" },
  { EnglishName: "East Azerbaijan", PersianName: "اذربایجان شرقی" },
  { EnglishName: "West Azerbaijan", PersianName: "اذربایجان غربی" },
  { EnglishName: "Bushehr", PersianName: "بوشهر" },
  {
    EnglishName: "Chahar Mahaal and Bakhtiari",
    PersianName: "چهار محال و بختیاری",
  },
  { EnglishName: "Khorasan, South", PersianName: "خراسان جنوبی" },
  { EnglishName: "Khorasan, Razavi", PersianName: "خراسان رضوی" },
  { EnglishName: "Khorasan, North", PersianName: "خراسان شمالی" },
  { EnglishName: "Khuzestan", PersianName: "خوزستان" },
  { EnglishName: "Zanjan", PersianName: "زنجان" },
  { EnglishName: "Semnan", PersianName: "سمنان" },
  { EnglishName: "Sistan and Baluchestan", PersianName: "سیستان و بلوچستان" },
  { EnglishName: "Fars", PersianName: "فارس" },
  { EnglishName: "Qazvin", PersianName: "قزوین" },
  { EnglishName: "Qom", PersianName: "قم" },
  { EnglishName: "Kurdistan", PersianName: "کردستان" },
  { EnglishName: "Kerman", PersianName: "کرمان" },
  { EnglishName: "Kermanshah", PersianName: "کرمانشاه" },
  {
    EnglishName: "Kohgiluyeh and Boyer-Ahmad",
    PersianName: "کهگیلویه و بویر احمد",
  },
  { EnglishName: "Golestan Province", PersianName: "گلستان" },
  { EnglishName: "Gilan", PersianName: "گیلان" },
  { EnglishName: "Lorestan", PersianName: "لرستان" },
  { EnglishName: "Mazandaran", PersianName: "مازندران" },
  { EnglishName: "Markazi", PersianName: "مرکزی" },
  { EnglishName: "Hormozgan", PersianName: "هرمزگان" },
  { EnglishName: "Yazd", PersianName: "یزد" },
  { EnglishName: "Hamadan", PersianName: "همدان" },
];

export const PERMISSIONS: Permission[] = [
  {
    id: "ViewAdmin",
    isActive: false,
    enLabel: "View Admin",
    faLabel: "دسترسی ادمین",
  },
  {
    id: "ViewDashboard",
    isActive: false,
    enLabel: "View Dashboard",
    faLabel: "نمایش داشبورد",
    subPermissions: [
      {
        id: "ViewCharts",
        isActive: false,
        enLabel: "View Charts",
        faLabel: "نمایش نمودار ها",
      },
      {
        id: "ViewTable",
        isActive: false,
        enLabel: "View Table",
        faLabel: "نمایش جدول",
      },
    ],
  },
  {
    id: "ManageUsers",
    isActive: false,
    enLabel: "Manage Users",
    faLabel: "مدیریت کاربر ها",
  },
  {
    id: "ManagePersonnel",
    isActive: false,
    enLabel: "Manage Personnel",
    faLabel: "مدیریت پرسنل",
  },
  {
    id: "ViewCities",
    isActive: false,
    enLabel: "View Cities",
    faLabel: "نمایش استان ها",
    subPermissions: CITIES.map((a, i) => {
      return {
        id: `View_${a.EnglishName.replace(" ", "_")}_${i}`,
        isActive: false,
        enLabel: a.EnglishName,
        faLabel: a.PersianName,
      };
    }),
  },
];

type City = {
  EnglishName: string;
  PersianName: string;
};

export const Text = {
  noData: {
    fa: "داده ای موجود نیست",
    en: "No Data",
  },
};

export const validDateBeforeToScrewThem = moment(
  "1402/08/06",
  "jYYYY/jMM/jDD",
).locale("fa");
