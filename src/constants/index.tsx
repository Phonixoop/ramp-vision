import { Permission } from "~/types";

export const THEMESE = [
  {
    label: "تم روشن 1",
    value: "theme-light-1",
  },
  {
    label: "تم روشن 2",
    value: "theme-light-2",
  },
  {
    label: "تم روشن 3",
    value: "theme-light-3",
  },
  {
    label: "تم روشن 4",
    value: "theme-light-4",
  },
  {
    label: "تم تیره 1",
    value: "theme-dark-1",
  },
  {
    label: "تم تیره 2",
    value: "theme-dark-2",
  },
  {
    label: "تم تیره 3",
    value: "theme-dark-3",
  },
];

export const Reports_Period = ["روزانه", "هفتگی", "ماهانه"];

export const CITIES: City[] = [
  // { EnglishName: "Tehran InDirect", PersianName: "تهران غیر مستقیم" },
  // { EnglishName: "Tehran Direct", PersianName: "تهران مستقیم" },
  // { EnglishName: "Tehran Jobran", PersianName: "تهران جبران" },
  // { EnglishName: "Tehran Not Jobran", PersianName: "تهران غیر جبران" },
  { EnglishName: "Tehran", PersianName: "تهران" },
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
    faLabel: "مدیریت کاربران",
  },
  {
    id: "ViewCities",
    isActive: false,
    enLabel: "View Cities",
    faLabel: "نمایش شهر ها",
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
