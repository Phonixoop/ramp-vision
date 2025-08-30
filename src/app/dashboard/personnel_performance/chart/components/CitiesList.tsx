import React from "react";
import moment from "jalali-moment";
import { BuildingIcon } from "lucide-react";
import AdvancedList from "~/features/advanced-list/indexm";
import { CityButton } from "./CityButton";
import { CityWithPerformanceData } from "~/types";
import { sparkChartForCity } from "~/utils/personnel-performance";
import { getPersianToEnglishCity } from "~/utils/util";

interface CitiesListProps {
  distincedData: CityWithPerformanceData[];
  listView: CityWithPerformanceData[];
  activeCity: string;
  navigatingToCity: string | null;
  getCitiesWithPerformance: any;
  reportPeriod: string;
  filters: any;
  isLoading: boolean;
  onNavigate: (cityName: string) => void;
  onListViewChange: (list: CityWithPerformanceData[]) => void;
}

export const CitiesList = React.memo<CitiesListProps>(
  ({
    distincedData,
    listView,
    activeCity,
    navigatingToCity,
    getCitiesWithPerformance,
    reportPeriod,
    filters,
    isLoading,
    onNavigate,
    onListViewChange,
  }) => {
    return (
      <AdvancedList
        className="xl:h-fit"
        title={
          <span className="flex items-center justify-center gap-2 text-primary">
            استان
            <BuildingIcon />
          </span>
        }
        isLoading={isLoading}
        disabled={!distincedData?.length && !isLoading}
        list={distincedData as any}
        selectProperty="CityName_Fa"
        downloadFileName={`عملکرد استان ها ${
          reportPeriod === "ماهانه" &&
          (filters?.filter?.Start_Date?.length ?? 0) === 1
            ? moment(filters?.filter?.Start_Date![0]!, "jYYYY,jMM,jDD")
                .locale("fa")
                .format("YYYY jMMMM")
            : (filters?.filter?.Start_Date ?? []).join(",")
        }`}
        headers={[
          { label: "عملکرد", key: "TotalPerformance" },
          { label: "شهر", key: "CityName_Fa" },
        ]}
        dataToDownload={listView}
        onChange={onListViewChange}
        renderItem={(item, i) => {
          const isActive = item.CityName_En === activeCity;

          const cityPerformances =
            getCitiesWithPerformance?.data?.result
              ?.filter(
                (x: any) =>
                  getPersianToEnglishCity(x?.CityName) === item.CityName_En,
              )
              ?.map((m: any) => m?.TotalPerformance) ?? [];

          return (
            <CityButton
              key={item.CityName_En ?? i}
              item={item}
              index={i}
              isActive={isActive}
              isNavigating={navigatingToCity === item.CityName_En}
              sparkChartData={sparkChartForCity(
                getCitiesWithPerformance?.data?.result ?? [],
                "CityName",
                item.CityName_En,
              )}
              cityPerformances={cityPerformances}
              onNavigate={onNavigate}
            />
          );
        }}
      />
    );
  },
);

CitiesList.displayName = "CitiesList";
