import { TableJson } from "~/types";

export const direct_Table_Hospital: TableJson = {
  title: "ارزیابی اسناد بیمارستانی",
  table: {
    "عملکرد کارشناس": {
      data: ["0 تا 25", "25 تا 35", "35 تا 40", "بیشتر از 40"],
    },
    "وضعیت عملکرد": {
      data: ["not ok", "ok", "excellent", "بررسی مدیریت فنی"],
    },
  },
};

export const direct_Table_Daro: TableJson = {
  title: "ارزیابی اسناد دارو",
  table: {
    "عملکرد کارشناس": {
      data: ["0 تا 200", "200 تا 250", "250 تا 300", "بیشتر از 300"],
    },
    "وضعیت عملکرد": {
      data: ["not ok", "ok", "excellent", "بررسی مدیریت فنی"],
    },
  },
};

export const direct_Table_Paziresh_Sabt_Avalie: TableJson = {
  title: "پذیرش و ثبت اولیه اسناد",
  table: {
    "عملکرد کارشناس": {
      data: ["0 تا 70", "70 تا 100", "100 تا 130", "بیشتر از 130"],
    },
    "وضعیت عملکرد": {
      data: ["not ok", "ok", "excellent", "بررسی مدیریت فنی"],
    },
  },
};

export const direct_Table_Sabt_Avalie_BedoneBime: TableJson = {
  title: "ثبت اولیه اسناد (بدون پذیرش از بیمه شده)",
  table: {
    "عملکرد کارشناس": {
      data: ["0 تا 300", "300 تا 350", "350 تا 400", "بیشتر از 400"],
    },
    "وضعیت عملکرد": {
      data: ["not ok", "ok", "excellent", "بررسی مدیریت فنی"],
    },
  },
};

export const direct_Table_WithScan: TableJson = {
  title: "ثبت ارزیابی با اسکن مدارک",
  table: {
    "عملکرد کارشناس": {
      data: ["0 تا 25", "25 تا 35", "35 تا 40", "بیشتر از 40"],
    },
    "وضعیت عملکرد": {
      data: ["not ok", "ok", "excellent", "بررسی مدیریت فنی"],
    },
  },
};

export const direct_Table_WithoutScan: TableJson = {
  title: "ثبت ارزیابی بدون اسکن مدارک",
  table: {
    "عملکرد کارشناس": {
      data: ["0 تا 250", "250 تا 300", "300 تا 350", "بیشتر از 350"],
    },
    "وضعیت عملکرد": {
      data: ["not ok", "ok", "excellent", "بررسی مدیریت فنی"],
    },
  },
};

export const direct_Table_Para_Dandan: TableJson = {
  title: "ارزیابی اسناد دندان + پاراکلینیکی",
  table: {
    "عملکرد کارشناس": {
      data: ["0 تا 150", "150 تا 200", "200 تا 250", "بیشتر از 250"],
    },
    "وضعیت عملکرد": {
      data: ["not ok", "ok", "excellent", "بررسی مدیریت فنی"],
    },
  },
};

// InDirect

export const indirect_Table_Hospital: TableJson = {
  title: "ارزیابی اسناد بیمارستانی",
  table: {
    "عملکرد کارشناس": {
      data: ["0 تا 25", "25 تا 35", "35 تا 40", "بیشتر از 40"],
    },
    "وضعیت عملکرد": {
      data: ["not ok", "ok", "excellent", "بررسی مدیریت فنی"],
    },
  },
};

export const inDirect_Table_Daro: TableJson = {
  title: "ارزیابی اسناد دارو",
  table: {
    "عملکرد کارشناس": {
      data: ["0 تا 300", "300 تا 375", "375 تا 450", "بیشتر از 450"],
    },
    "وضعیت عملکرد": {
      data: ["not ok", "ok", "excellent", "بررسی مدیریت فنی"],
    },
  },
};

export const inDirect_Table_WithoutScan: TableJson = {
  title: "ثبت ارزیابی بدون اسکن مدارک",
  table: {
    "عملکرد کارشناس": {
      data: ["0 تا 375", "375 تا 450", "450 تا 525", "بیشتر از 525"],
    },
    "وضعیت عملکرد": {
      data: ["not ok", "ok", "excellent", "بررسی مدیریت فنی"],
    },
  },
};

export const inDirect_Table_Para_Dandan: TableJson = {
  title: "ارزیابی اسناد دندان + پاراکلینیکی",
  table: {
    "عملکرد کارشناس": {
      data: ["0 تا 225", "225 تا 300", "300 تا 375", "بیشتر از 375"],
    },
    "وضعیت عملکرد": {
      data: ["not ok", "ok", "excellent", "بررسی مدیریت فنی"],
    },
  },
};
