import { LayoutGroup } from "framer-motion";
import moment from "jalali-moment";
import React, { useMemo, useState } from "react";
import DatePicker from "react-multi-date-picker";
import { CITIES, City_Levels, Reports_Period } from "~/constants";
import {
  FilterType,
  PeriodType,
  usePersonnelFilter,
} from "~/context/personnel-filter.context";
import Header from "~/features/header";
import { InPageMenu } from "~/features/menu";
import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";
import { api } from "~/utils/api";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import {
  DistinctData,
  calculateAggregateByFields,
  en,
  getEnglishToPersianCity,
  getPerformanceText,
} from "~/utils/util";
import { SelectControlled } from "~/features/checkbox-list";
import H2 from "~/ui/heading/h2";
import Gauge from "~/features/gauge";
import {
  defaultProjectTypes,
  defualtContractTypes,
  defualtRoles,
} from "~/constants/personnel-performance";
import DatePickerPeriodic from "~/features/date-picker-periodic";
import { FilterIcon } from "lucide-react";
import ResponsiveView from "~/features/responsive-view";
import { distinctDataAndCalculatePerformance } from "~/utils/personnel-performance";

export default function GaugesPage() {
  const [reportPeriod, setReportPeriod] = useState<PeriodType>("روزانه");

  const [filters, setFilters] = useState<FilterType>({
    periodType: "روزانه",
    filter: {
      Start_Date: [
        moment().locale("fa").subtract(2, "days").format("YYYY/MM/DD"),
      ],
    },
  });

  const getCitiesWithPerformance =
    api.personnelPerformance.getCitiesWithPerformance.useQuery(
      {
        periodType: filters?.periodType,
        filter: {
          Start_Date: filters?.filter?.Start_Date,
          ProjectType: filters?.filter?.ProjectType ?? defaultProjectTypes,
          Role: filters?.filter?.Role ?? defualtRoles,
          ContractType: filters?.filter?.ContractType ?? defualtContractTypes,
          RoleType: filters?.filter?.RoleType,
          DateInfo: filters?.filter?.DateInfo,
        },
      },
      {
        onSuccess: (data) => {},
        refetchOnWindowFocus: false,
      },
    );

  // const operations = [
  //   { fieldName: "TotalPerformance", operation: "average" },
  //   { fieldName: "Start_Date", operation: "array" },
  // ];

  const getInitialFilters = api.personnelPerformance.getInitialFilters.useQuery(
    {
      filter: {
        ProjectType: filters.filter.ProjectType,
        DateInfo: filters.filter.DateInfo,
      },
    },
  );

  const DateInfos = [
    ...new Set(
      getInitialFilters?.data?.DateInfos?.map((a) => a.DateInfo).filter(
        (a) => a,
      ),
    ),
  ];

  const Roles = [
    ...new Set(
      getInitialFilters?.data?.usersInfo?.map((a) => a.Role).filter((a) => a),
    ),
  ];

  const ContractTypes = [
    ...new Set(
      getInitialFilters?.data?.usersInfo
        ?.map((a) => a.ContractType)
        .filter((a) => a),
    ),
  ];
  const [cityLevel, setCityLevel] = useState({
    index: -1,
    cities: [],
  });
  const result = useMemo(() => {
    if (cityLevel.cities.length > 0)
      return distinctDataAndCalculatePerformance(
        getCitiesWithPerformance.data,
      ).filter((city) => cityLevel.cities.includes(city.CityName_Fa));

    return distinctDataAndCalculatePerformance(getCitiesWithPerformance.data);
  }, [getCitiesWithPerformance.data, cityLevel]);
  return (
    <>
      <BlurBackground />

      <div
        className="flex min-h-screen w-full flex-col gap-5 bg-secondary"
        dir="rtl"
      >
        <div className="mx-auto flex w-11/12 flex-col-reverse items-center justify-between  gap-5  py-5 md:flex-row-reverse md:items-start">
          <div className="grid grid-cols-1 gap-4  sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {getCitiesWithPerformance.isLoading ? (
              <>
                {Array.from(
                  Array(getInitialFilters?.data?.Cities?.lenght ?? 31).keys(),
                ).map((a, i) => {
                  return (
                    <>
                      <div
                        key={i}
                        className="flex h-36 w-36  flex-col items-center justify-between  gap-5 rounded-2xl bg-secbuttn "
                      />
                    </>
                  );
                })}
              </>
            ) : (
              result.map((city: any, i) => {
                return (
                  <>
                    <div
                      key={i}
                      className="flex w-full  flex-col items-center  justify-between gap-5 rounded-2xl "
                    >
                      <div className="flex w-full flex-col items-center justify-between gap-5  rounded-2xl border border-dashed border-accent/50 bg-secbuttn/50 py-5 xl:w-auto  xl:p-5">
                        <H2>{getEnglishToPersianCity(city.CityName_Fa)}</H2>

                        <Gauge value={city.TotalPerformance} />
                        <p className="text-accent">
                          {getPerformanceText(city.TotalPerformance)}
                        </p>
                      </div>
                    </div>
                  </>
                );
              })
            )}
          </div>
          <ResponsiveView
            className="z-20 flex max-h-[100vh] flex-wrap items-stretch justify-center gap-1 py-5 sm:max-h-min sm:bg-transparent sm:py-0"
            dir="rtl"
            btnClassName="bg-secondary text-primary"
            icon={
              <>
                <span className="px-2">فیلترها</span>
                <FilterIcon className="stroke-primary" />
              </>
            }
          >
            {" "}
            <div className="flex  flex-col ">
              <div className="flex min-w-[15rem] max-w-sm flex-col items-center justify-around gap-3 rounded-xl bg-secondary p-2">
                <span className="font-bold text-primary">بازه گزارش</span>
                <DatePickerPeriodic
                  filter={filters}
                  reportPeriod={reportPeriod}
                  onChange={(date) => {
                    if (!date) return;

                    if (Array.isArray(date) && date.length <= 0) return;
                    let dates = [];
                    if (Array.isArray(date)) {
                      dates = date
                        .filter((a) => a.format() != "")
                        .map((a) => en(a.format("YYYY/MM/DD")));
                    } else {
                      if (date.format() != "")
                        dates = [en(date.format("YYYY/MM/DD"))];
                    }
                    if (dates.length <= 0) return;
                    //@ts-ignore
                    setFilters((prev) => {
                      return {
                        periodType: reportPeriod,
                        filter: {
                          Start_Date: dates,
                        },
                      };
                    });
                  }}
                  setReportPeriod={setReportPeriod}
                />
              </div>
              {!getInitialFilters.isLoading && (
                <>
                  <div className="flex min-w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                    <span className="font-bold text-primary">سمت</span>
                    <SelectControlled
                      withSelectAll
                      title={"سمت"}
                      list={Roles}
                      value={
                        filters.filter.Role ??
                        defualtRoles.filter((item) => Roles.includes(item))
                      }
                      onChange={(values) => {
                        //@ts-ignore
                        setFilters((prev) => {
                          return {
                            periodType: reportPeriod,
                            filter: {
                              ...prev.filter,
                              Role: values,
                            },
                          };
                        });
                      }}
                    />
                  </div>
                  <div className="flex min-w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                    <span className="font-bold text-primary">استان</span>

                    <LayoutGroup id="CityLevelMenu">
                      <InPageMenu
                        list={City_Levels.map((a) => a.name)}
                        startIndex={-1}
                        index={cityLevel.index}
                        onChange={(value) => {
                          const cities = City_Levels.find(
                            (a) => a.name === value.item.name,
                          ).cities;
                          console.log({ cities });
                          setCityLevel({
                            index: value.index,
                            cities: cities.map(getEnglishToPersianCity),
                          });
                        }}
                      />
                    </LayoutGroup>

                    <SelectControlled
                      withSelectAll
                      list={getCitiesWithPerformance.data?.result?.map((a) =>
                        getEnglishToPersianCity(a.CityName),
                      )}
                      title={"استان"}
                      value={cityLevel.cities}
                      onChange={(values) => {
                        setCityLevel((prev) => {
                          return {
                            index: 0,
                            cities: values,
                          };
                        });
                      }}
                    />
                  </div>
                  <div className="flex min-w-[15rem] max-w-sm  flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                    <span className="font-bold text-primary">نوع پروژه</span>
                    <SelectControlled
                      withSelectAll
                      title={"نوع پروژه"}
                      list={getInitialFilters?.data?.ProjectTypes}
                      value={filters.filter.ProjectType ?? defaultProjectTypes}
                      onChange={(values) => {
                        //@ts-ignore
                        setFilters((prev) => {
                          return {
                            periodType: reportPeriod,
                            filter: {
                              ...prev.filter,
                              ProjectType: values,
                            },
                          };
                        });
                      }}
                    />
                  </div>

                  <div className="flex min-w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                    <span className="font-bold text-primary">نوع قرار داد</span>
                    <SelectControlled
                      withSelectAll
                      title={"نوع قرار داد"}
                      list={ContractTypes}
                      value={
                        filters.filter.ContractType ??
                        defualtContractTypes.filter((item) =>
                          ContractTypes.includes(item),
                        )
                      }
                      onChange={(values) => {
                        //@ts-ignore
                        setFilters((prev) => {
                          return {
                            periodType: reportPeriod,
                            filter: {
                              ...prev.filter,
                              ContractType: values,
                            },
                          };
                        });
                      }}
                    />
                  </div>
                  <div className="flex min-w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                    <span className="font-bold text-primary">نوع سمت</span>
                    <SelectControlled
                      withSelectAll
                      title={"نوع سمت"}
                      list={[
                        ...new Set(
                          getInitialFilters?.data?.usersInfo
                            ?.map((a) => a.RoleType)
                            .filter((a) => a),
                        ),
                      ]}
                      value={filters.filter.RoleType ?? []}
                      onChange={(values) => {
                        //@ts-ignore
                        setFilters((prev) => {
                          return {
                            periodType: reportPeriod,
                            filter: {
                              ...prev.filter,
                              RoleType: values,
                            },
                          };
                        });
                      }}
                    />
                  </div>
                  <div className="flex min-w-[15rem] max-w-sm flex-col items-center justify-center gap-3 rounded-xl bg-secondary p-2">
                    <span className="font-bold text-primary">
                      تاریخ گزارش پرسنل
                    </span>
                    <SelectControlled
                      title={"تاریخ گزارش پرسنل"}
                      list={DateInfos}
                      value={filters.filter.DateInfo ?? [DateInfos[0]]}
                      onChange={(values) => {
                        let _values = values;
                        _values = [values[0]];
                        //@ts-ignore
                        setFilters((prev) => {
                          return {
                            periodType: reportPeriod,
                            filter: {
                              ...prev.filter,
                              DateInfo: _values,
                            },
                          };
                        });
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </ResponsiveView>
        </div>
      </div>
    </>
  );
}
