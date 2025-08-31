"use client";

import React from "react";
import { useCityPage } from "../hooks/useCityPage";
import { PersonnelList, PersonnelDetails, CityOverview } from "./components";

export default function CityPage() {
  const {
    currentCity,
    selectedPerson,
    displayedList,
    getAll,
    filters,
    pageLoading,
    onFilterByLevel,
    onSelectPerson,
    setSelectedPerson,
  } = useCityPage();

  if (!currentCity) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-primary">شهر یافت نشد</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex  flex-col items-center justify-between gap-5  transition-colors duration-1000">
      <div className="flex w-full flex-row-reverse justify-start gap-4  divide-secbuttn ">
        {/* Personnel List */}
        <div className=" min-w-[380px]">
          <PersonnelList
            displayedList={displayedList}
            currentCity={currentCity}
            filters={filters}
            reportPeriod={filters?.periodType || "ماهانه"}
            pageLoading={pageLoading}
            getAll={getAll}
            selectedPerson={selectedPerson}
            onFilterByLevel={onFilterByLevel}
            onSelectPerson={onSelectPerson}
          />
        </div>

        <div className="w-full">
          {/* Personnel Details */}
          {selectedPerson && (
            <PersonnelDetails
              selectedPerson={selectedPerson}
              currentCity={currentCity}
              filters={filters}
              getAll={getAll}
              setSelectedPerson={setSelectedPerson}
            />
          )}
        </div>

        {/* City Overview */}
      </div>
      <CityOverview
        currentCity={currentCity}
        filters={filters}
        selectedPerson={selectedPerson}
      />
    </div>
  );
}
