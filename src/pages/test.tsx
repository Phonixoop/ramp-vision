import { AreaChart, Card, Title } from "@tremor/react";
import moment from "jalali-moment";
import { twMerge } from "tailwind-merge";
import { validDateBeforeToScrewThem } from "~/constants";
import Calender from "~/features/calender";
import CustomPieChart from "~/features/custom-charts/pie-chart";

import H2 from "~/ui/heading/h2";
import {
  distinctPersonnelPerformanceData,
  getMonthNamesFromJOINED_date_strings,
} from "~/utils/personnel-performance";

const chartdata = [
  {
    date: "Jan 22",
    SemiAnalysis: 2890,
    "The Pragmatic Engineer": 2338,
  },
  {
    date: "Feb 22",
    SemiAnalysis: 2756,
    "The Pragmatic Engineer": 2103,
  },
  {
    date: "Mar 22",
    SemiAnalysis: 3322,
    "The Pragmatic Engineer": 2194,
  },
  {
    date: "Apr 22",
    SemiAnalysis: 3470,
    "The Pragmatic Engineer": 2108,
  },
  {
    date: "May 22",
    SemiAnalysis: 3475,
    "The Pragmatic Engineer": 1812,
  },
  {
    date: "Jun 22",
    SemiAnalysis: 3129,
    "The Pragmatic Engineer": 1726,
  },
];

const valueFormatter = function (number) {
  return "$ " + new Intl.NumberFormat("us").format(number).toString();
};

const m = moment("1367/11/4", "jYYYY/jM/jD");
m.locale("fa");
const isSameOrBefore = m.isSameOrBefore(moment("1402/08/06", "jYYYY/jM/jD"));

const menuItems = [
  {
    value: "Home",
    link: "/",
  },
  {
    value: "Products",
    link: "/products",
    subMenu: [
      {
        value: "Category 1",
        link: "/products/category1",
        subMenu: [
          {
            value: "Subcategory 1",
            link: "/products/category1/subcategory1",
          },
          {
            value: "Subcategory 2",
            link: "/products/category1/subcategory2",
          },
        ],
      },
      {
        value: "Category 2",
        link: "/products/category2",
      },
    ],
  },
  {
    value: "Contact",
    link: "/contact",
  },
];

const data = [
  {
    CityName: "a",
    Start_Date: "5",
    TotalPerformance: 10,
    COUNT: 0,
  },
  {
    CityName: "a",
    Start_Date: "6",
    TotalPerformance: 40,
  },
  {
    CityName: "b",
    Start_Date: "5",
    TotalPerformance: 7,
  },
];
const result = distinctPersonnelPerformanceData(
  {
    periodType: "ماهانه",
    dateLength: {
      a: 2,
      b: 1,
    },

    result: data,
  },
  ["CityName"],
  ["TotalPerformance"],
);

// console.log(JSON.stringify(result, null, 2));

export default function TestPage() {
  // const isSameOrBefore = date.isSameOrBefore(validDateBeforeToScrewThem);
  return (
    <>
      {/* <CustomPieChart data={[]} index={"value"} /> */}
      <div className="flex h-screen items-center justify-center text-primary">
        {/* {getMonthNamesFromJOINED_date_strings("1402/10/02", "هفتگی")} */}
        {/* <div dir="rtl" className="max-w-sm">
        <Calender
          onDate={(date, monthNumber) => (
            <>
              {parseInt(date.format("M")) !== monthNumber + 1 ? (
                <span className="text-sm text-primary/50">
                  {date.format("D")}
                </span>
              ) : (
                <span>{date.format("D")}</span>
              )}
            </>
          )}
        />
      </div> */}
        {/* <Menu menuItems={menuItems} className="flex" /> */}
      </div>
    </>
  );
}

// function MenuItem({ item, className }) {
//   return (
//     <li className={className} key={item.value}>
//       <a href={item.link} className="block px-4 py-2 text-white">
//         {item.value}
//         {item.subMenu && " >"}
//       </a>
//       {item.subMenu && item.subMenu.length > 0 && (
//         <Menu
//           menuItems={item.subMenu}
//           className=" hidden flex-col group-hover:flex"
//           itemClassName=" hidden group-hover:flex"
//         />
//       )}
//     </li>
//   );
// }

// function Menu({ menuItems, className = "", itemClassName = "" }) {
//   return (
//     <ul className={twMerge(" flex", className)}>
//       {menuItems.map((item) => (
//         <MenuItem
//           item={item}
//           className={twMerge(
//             "group relative  flex-row bg-secondary ",
//             itemClassName,
//           )}
//         />
//       ))}
//     </ul>
//   );
// }
