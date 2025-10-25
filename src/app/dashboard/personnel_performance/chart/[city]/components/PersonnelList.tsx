import React from "react";
import moment from "jalali-moment";
import { Contact2Icon } from "lucide-react";
import { cn } from "~/lib/utils";
import AdvancedList from "~/features/advanced-list/indexm";
import Button from "~/ui/buttons";
import { PersonnelRowOptimized } from "./PersonnelRowOptimized";
import { performanceLevels } from "~/constants/personnel-performance";
import { getEnglishToPersianCity } from "~/utils/util";

type Rating = "Weak" | "Average" | "Good" | "Excellent" | "NeedsReview" | "ALL";

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
  onFilterByLevel: (rating: Rating) => void;
  onSelectPerson: (person: PersonRecord, sparkData?: any[]) => void;
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
    onFilterByLevel,
    onSelectPerson,
  }) => {
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
          <div
            dir="rtl"
            className="flex w-full items-center justify-center gap-2 py-2"
          >
            {performanceLevels.map((level) => {
              const isSelected = false; // This will be handled by the parent component
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
            onSelect={(sparkData) => onSelectPerson(user, sparkData)}
          />
        )}
      />
    );
  },
);

PersonnelList.displayName = "PersonnelList";
