"use client";

import { Column } from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "~/components/shadcn/tabs";
import { City_Levels } from "~/constants";
import { cn } from "~/lib/utils";
import Button from "~/ui/buttons";
import ExclamationIcon from "~/ui/icons/exclamation";
import ToolTip from "~/ui/tooltip";
import { getEnglishToPersianCity, getPersianToEnglishCity } from "~/utils/util";

interface CityLevelTabsProps {
  initialCities: string[];
  column: Column<any>;
  onChange?: (filter: { id: string; values: string[] }) => void;
}

export function CityLevelTabs({
  column,
  onChange,
  initialCities,
}: CityLevelTabsProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { getFilterValue } = column as Column<any>;
  const filterValue = getFilterValue() as string[];

  // Convert filter values to English city names for comparison
  const currentFilterCities = useMemo(() => {
    const converted =
      filterValue?.map((city: any) => getPersianToEnglishCity(city)) || [];
    return converted;
  }, [filterValue]);

  // // Determine active tab based on current filter values
  // useEffect(() => {
  //   if (!currentFilterCities || currentFilterCities.length === 0) {
  //     setActiveTab(null);
  //     return;
  //   }

  //   const matchingTab = City_Levels.find((level) => {
  //     const tabCities = level.cities;
  //     const currentCitiesSet = new Set(currentFilterCities);
  //     const tabCitiesSet = new Set(tabCities);

  //     // Check if current cities are exactly the same as tab cities
  //     const isMatch =
  //       currentCitiesSet.size === tabCitiesSet.size &&
  //       [...currentCitiesSet].every((city) => tabCitiesSet.has(city));

  //     return isMatch;
  //   });

  //   setActiveTab(matchingTab?.name || null);
  // }, [currentFilterCities]);

  // Reset active tab when filter is cleared
  useEffect(() => {
    if (!currentFilterCities || currentFilterCities.length === 0) {
      setActiveTab(null);
    }
  }, [currentFilterCities]);

  function handleTabChange(selectedTab: string) {
    setActiveTab(selectedTab);

    const cities: string[] =
      City_Levels.find((a) => a.name === selectedTab)?.cities ?? [];

    // Filter cities based on permissions (initialCities)
    const canFilterCities = cities
      .filter((city) => {
        const mappedInitialCities = initialCities?.map((initCity: any) =>
          getPersianToEnglishCity(initCity),
        );
        return mappedInitialCities?.includes(city) ?? false;
      })
      .map((cityName) => {
        const persianName = getEnglishToPersianCity(cityName);
        return persianName;
      });

    const finalCities = canFilterCities;

    // Let the parent handle the filtering through onChange
    onChange?.({ id: column.id, values: finalCities });
  }

  return (
    <TabComponent
      tabs={City_Levels.map((level) => level.name)}
      onChange={handleTabChange}
      activeTab={activeTab}
      initialCities={initialCities}
    />
  );
}

interface CustomTabButtonProps {
  tabs: string[];
  onChange: (tab: string) => void;
  activeTab?: string | null;
  initialCities: string[];
}

function TabComponent({
  tabs,
  activeTab,
  onChange,
  initialCities,
}: CustomTabButtonProps) {
  const [isSelected, setIsSelected] = useState<string | null>(
    activeTab || null,
  );

  useEffect(() => {
    setIsSelected(activeTab || null);
  }, [activeTab]);

  function getMissingCities(tabName: string) {
    const tabLevel = City_Levels.find((level) => level.name === tabName);
    if (!tabLevel) return [];

    const mappedInitialCities =
      initialCities?.map((initCity: any) =>
        getPersianToEnglishCity(initCity),
      ) || [];

    const missingCities = tabLevel.cities.filter(
      (city) => !mappedInitialCities.includes(city),
    );

    return missingCities.map((city) => getEnglishToPersianCity(city));
  }

  return (
    <div className="flex flex-row items-center justify-center gap-2">
      {tabs.map((tab) => {
        return (
          <div key={tab} className="flex items-center gap-1">
            <Button
              className={cn(
                "rounded-full px-4 py-2",
                isSelected === tab && "bg-accent text-primary",
              )}
              onClick={() => {
                setIsSelected(tab);
                onChange(tab);
              }}
            >
              {tab}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
