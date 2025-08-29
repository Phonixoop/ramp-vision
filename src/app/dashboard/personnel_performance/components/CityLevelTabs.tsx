"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "~/components/shadcn/tabs";
import { City_Levels } from "~/constants";
import { getEnglishToPersianCity, getPersianToEnglishCity } from "~/utils/util";

interface CityLevelTabsProps {
  initialFilters: any;
  setDataFilters: (filters: any) => void;
  setFilterValue: (value: string[]) => void;
  onChange?: (selectedTab: string) => void;
}

export function CityLevelTabs({
  initialFilters,
  setDataFilters,
  setFilterValue,
  onChange,
}: CityLevelTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("");

  function handleTabChange(value: string) {
    setActiveTab(value);

    // Call the onChange callback if provided
    onChange?.(value);

    const cities: string[] =
      City_Levels.find((a) => a.name === value)?.cities ?? [];

    const canFilterCities = cities
      .filter((city) => {
        const mappedCities = initialFilters?.Cities?.map((initCity: any) =>
          getPersianToEnglishCity(initCity.CityName),
        );
        return mappedCities?.includes(city) ?? false;
      })
      .map((cityName) => {
        const persianName = getEnglishToPersianCity(cityName);
        return persianName;
      });

    if (cities.length <= 0) {
      setFilterValue(initialFilters?.Cities ?? []);
    } else {
      setFilterValue(canFilterCities);
    }

    const cityNames = canFilterCities.map(getPersianToEnglishCity);

    setDataFilters((prev: any) => ({
      ...prev,
      filter: {
        CityName: cityNames,
        Start_Date: prev.filter?.Start_Date ?? [],
      },
    }));
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-secondary">
        {City_Levels.map((level) => (
          <TabsTrigger
            key={level.name}
            value={level.name}
            className="text-primary data-[state=active]:bg-accent data-[state=active]:text-secondary"
          >
            {level.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
