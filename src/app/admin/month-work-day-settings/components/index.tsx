"use client";

import React, { useState, useEffect } from "react";
import moment from "jalali-moment";
import Modal from "~/ui/modals";
import Button from "~/ui/buttons";
import { NumberFieldWithLabel } from "~/ui/forms/with-lables";
import { cn } from "~/lib/utils";

interface MonthWorkDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (year: number, month: number, workDays: number) => void;
  selectedYear: number;
  selectedMonth: number;
  currentWorkDays?: number;
  isLoading?: boolean;
}

function MonthWorkDayModal({
  isOpen,
  onClose,
  onSave,
  selectedYear,
  selectedMonth,
  currentWorkDays = 0,
  isLoading = false,
}: MonthWorkDayModalProps) {
  const [workDays, setWorkDays] = useState(currentWorkDays);

  // Update workDays when currentWorkDays prop changes
  useEffect(() => {
    setWorkDays(currentWorkDays);
  }, [currentWorkDays]);

  const handleSave = () => {
    onSave(selectedYear, selectedMonth, workDays);
  };

  const handleClose = () => {
    setWorkDays(currentWorkDays); // Reset to original value
    onClose();
  };

  // Get Persian month name
  const getPersianMonthName = (month: number) => {
    const monthNames = [
      "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
      "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    ];
    return monthNames[month - 1];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="تنظیم روزهای کاری ماه"
      size="xs"
      center
      className="bg-secbuttn border-none"
    >
      <div className="flex flex-col gap-6 p-4">
        {/* Month and Year Display */}
        <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-4">
          <span className="text-lg font-medium text-primary">
            {getPersianMonthName(selectedMonth)} {selectedYear}
          </span>
        </div>

        {/* Work Days Input */}
        <div className="flex flex-col gap-2">
          <NumberFieldWithLabel
            label="تعداد روزهای کاری"
            value={workDays.toString()}
            onValueChange={(value) => setWorkDays(parseInt(value) || 0)}
            min={0}
            max={31}
            className="bg-transparent border-primary/20 focus:border-accent"
          />
          <p className="text-xs text-primary/70">
            حداکثر ۳۱ روز قابل تنظیم است
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handleClose}
            className="flex-1 border border-primary/20 text-primary hover:bg-primary/10"
          >
            انصراف
          </Button>
          <Button
            onClick={handleSave}
            isLoading={isLoading}
            disabled={workDays < 0 || workDays > 31}
            className={cn(
              "flex-1",
              workDays >= 0 && workDays <= 31
                ? "bg-accent text-primary hover:bg-accent/90"
                : "cursor-not-allowed bg-muted text-muted-foreground"
            )}
          >
            ذخیره
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default MonthWorkDayModal;
