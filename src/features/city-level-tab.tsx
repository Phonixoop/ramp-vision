"use client";

import { Column } from "@tanstack/react-table";
import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "~/components/shadcn/tabs";
import { City_Levels } from "~/constants";
import { cn } from "~/lib/utils";
import Button from "~/ui/buttons";
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
    console.log("Converting filter values:", { filterValue, converted });
    return converted;
  }, [filterValue]);

  // Determine active tab based on current filter values
  useEffect(() => {
    console.log("currentFilterCities changed:", currentFilterCities);

    if (!currentFilterCities || currentFilterCities.length === 0) {
      console.log("No cities selected, setting activeTab to null");
      setActiveTab(null);
      return;
    }

    const matchingTab = City_Levels.find((level) => {
      const tabCities = level.cities;
      const currentCitiesSet = new Set(currentFilterCities);
      const tabCitiesSet = new Set(tabCities);

      // Check if current cities are exactly the same as tab cities
      const isMatch =
        currentCitiesSet.size === tabCitiesSet.size &&
        [...currentCitiesSet].every((city) => tabCitiesSet.has(city));

      return isMatch;
    });

    setActiveTab(matchingTab?.name || null);
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
    />
  );
}

interface CustomTabButtonProps {
  tabs: string[];
  onChange: (tab: string) => void;
  activeTab?: string | null;
}

function TabComponent({ tabs, activeTab, onChange }: CustomTabButtonProps) {
  const [isSelected, setIsSelected] = useState<string | null>(
    activeTab || null,
  );

  useEffect(() => {
    setIsSelected(activeTab || null);
  }, [activeTab]);

  return (
    <div className="flex flex-row items-center justify-center">
      {tabs.map((tab) => (
        <Button
          key={tab}
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
      ))}
    </div>
  );
}
