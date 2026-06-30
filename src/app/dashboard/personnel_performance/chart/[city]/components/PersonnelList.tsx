import React from "react";
import moment from "jalali-moment";
import { Contact2Icon } from "lucide-react";
import { cn } from "~/lib/utils";
import AdvancedList from "~/features/advanced-list/indexm";
import Button from "~/ui/buttons";
import { PersonnelRowOptimized } from "./PersonnelRowOptimized";
import { performanceLevels } from "~/constants/personnel-performance";
import { TEHRAN_SUB_CITIES } from "~/constants";
import { getEnglishToPersianCity } from "~/utils/util";

type Rating = "Weak" | "Average" | "Good" | "Excellent" | "NeedsReview" | "ALL";
type TehranSubCity = (typeof TEHRAN_SUB_CITIES)[number];

type PersonRecord = Record<string, any> & {
  NationalCode?: string;
  NameFamily?: string;
  Role?: string;
  TotalPerformance?: number;
  Start_Date?: string;
  key?: { CityName: string; NameFamily: string; NationalCode: string };
};

interface PersonnelListProps {
  displayedList: PersonRecord[];
  currentCity: string;
  filters: any;
  reportPeriod: string;
  pageLoading: boolean;
  getAll: any;
  selectedPerson: PersonRecord | null;
  isTehran: boolean;
  levelFilter: Rating;
  tehranSubCities: TehranSubCity[];
  onFilterByLevel: (rating: Rating) => void;
  onTehranSubCityChange: (city: TehranSubCity) => void;
  onSelectPerson: (
    person: PersonRecord,
    sparkData?: any[],
    StartDate?: string,
    periodType?: string,
  ) => void;
}

export const PersonnelList = React.memo<PersonnelListProps>(
  ({
    displayedList,
    currentCity,
    filters,
    reportPeriod,
    pageLoading,
    getAll,
    selectedPerson,
    isTehran,
    levelFilter,
    tehranSubCities,
    onFilterByLevel,
    onTehranSubCityChange,
    onSelectPerson,
  }) => {
    const tehranSubCityLabels: Record<Exclude<TehranSubCity, null>, string> = {
      "Tehran Jobran": "جبران",
      "Tehran Not Jobran": "غیر جبران",
      "Tehran InDirect": "غیر مستقیم",
    };

    return (
      <AdvancedList
        title={
          <span className="flex items-center justify-center gap-2 text-primary">
            پرسنل
            <Contact2Icon
              className={
                !displayedList?.length ? "animate-bounce duration-75" : ""
              }
            />
          </span>
        }
        isLoading={pageLoading || getAll?.isLoading}
        disabled={pageLoading || !displayedList?.length}
        list={() => displayedList}
        filteredList={
          !(pageLoading || getAll?.isLoading)
            ? displayedList
            : Array.from({ length: 10 }, () => undefined as any)
        }
        selectProperty={"NameFamily"}
        downloadFileName={`${getEnglishToPersianCity(
          currentCity,
        )} عملکرد پرسنل شهر ${
          reportPeriod === "ماهانه" &&
          (filters.filter.Start_Date?.length ?? 0) === 1
            ? moment(filters.filter.Start_Date![0]!, "jYYYY,jMM,jDD")
                .locale("fa")
                .format("YYYY jMMMM")
            : (filters.filter.Start_Date ?? []).join(",")
        }`}
        headers={[
          { label: "عملکرد", key: "TotalPerformance" },
          { label: "پرسنل", key: "NameFamily" },
        ]}
        dataToDownload={displayedList}
        renderUnderButtons={() => (
          <div dir="rtl" className="flex w-full flex-col items-center gap-2 py-2">
            {isTehran && (
              <div className="flex w-full flex-wrap items-center justify-center gap-2">
                {TEHRAN_SUB_CITIES.map((city) => {
                  const isSelected = tehranSubCities.includes(city);
                  return (
                    <Button
                      key={city}
                      onClick={() => onTehranSubCityChange(city)}
                      className={cn(
                        "rounded-full border border-primary px-3 py-1 text-sm",
                        isSelected
                          ? "bg-primary text-secondary"
                          : "bg-transparent text-primary",
                      )}
                    >
                      {tehranSubCityLabels[city]}
                    </Button>
                  );
                })}
              </div>
            )}
            <div className="flex w-full flex-wrap items-center justify-center gap-2">
              {performanceLevels.map((level) => {
                const isSelected = levelFilter === level.enText;
                return (
                  <Button
                    key={level.enText}
                    onClick={() => onFilterByLevel(level.enText as Rating)}
                    className={cn(
                      "rounded-full px-2 py-1 text-sm",
                      isSelected ? "text-white" : "text-primary",
                    )}
                    style={{
                      backgroundColor: isSelected ? level.color : "transparent",
                      borderColor: level.color,
                      borderWidth: "1px",
                    }}
                  >
                    {level.text}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
        renderItem={(user: PersonRecord, index: number) => (
          <PersonnelRowOptimized
            key={`${user?.NationalCode || "unknown"}-${
              user?.NameFamily || "unknown"
            }-${user?.Role || "unknown"}-${user?.BranchName || "unknown"}-${
              user?.Start_Date || "unknown"
            }-${index}`}
            isActive={
              selectedPerson?.NationalCode +
                selectedPerson?.NameFamily +
                selectedPerson?.Role ===
              user.NationalCode + user.NameFamily + user.Role
            }
            user={user}
            activeKey={{
              nc: selectedPerson?.NationalCode,
              name: selectedPerson?.NameFamily,
              role: selectedPerson?.Role,
            }}
            getAllData={getAll?.data?.result ?? []}
            onSelect={(sparkData) =>
              onSelectPerson(user, sparkData, "", getAll?.data?.periodType)
            }
          />
        )}
      />
    );
  },
);

PersonnelList.displayName = "PersonnelList";
