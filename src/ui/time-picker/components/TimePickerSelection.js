import React, { useEffect, useState } from "react";
import HourFormat from "./HourFormat";
import HourWheel from "./HourWheel";
import MinuteWheel from "./MinuteWheel";

function TimePickerSelection({
  pickerDefaultValue,
  initialValue,
  onChange,
  height,
  onSave,
  onCancel,
  cancelButtonText,
  saveButtonText,
  controllers,
  setIsOpen,
  seperator,
  use12Hours,
  onAmPmChange,
}) {
  const initialTimeValue = use12Hours ? initialValue.slice(0, 5) : initialValue;
  const [value, setValue] = useState(
    initialValue === null ? pickerDefaultValue : initialTimeValue
  );
  const [hourFormat, setHourFormat] = useState({
    mount: false,
    hourFormat: initialValue.slice(6, 8),
  });

  useEffect(() => {
    if (controllers === false) {
      const finalSelectedValue = use12Hours
        ? `${value} ${hourFormat.hourFormat}`
        : value;
      // setInputValue(finalSelectedValue);
      onChange(finalSelectedValue);
    }
  }, [value]);

  useEffect(() => {
    if (hourFormat.mount) {
      onAmPmChange(hourFormat.hourFormat);
    }
  }, [hourFormat]);

  const params = {
    height,
    value,
    setValue,
    controllers,
    use12Hours,
    onAmPmChange,
    setHourFormat,
    hourFormat,
  };

  const handleSave = () => {
    const finalSelectedValue = use12Hours
      ? `${value} ${hourFormat.hourFormat}`
      : value;
    // setInputValue(finalSelectedValue);
    onChange(finalSelectedValue);
    onSave(finalSelectedValue);
    setIsOpen(false);
  };
  const handleCancel = () => {
    onCancel();
    setIsOpen(false);
  };

  return (
    <div className="react-ios-time-picker react-ios-time-picker-transition bg-accent/10 backdrop-blur-sm">
      {controllers && (
        <div className="relative z-50 flex justify-between  border-b-slate-700 bg-accent/10">
          <button
            className="z-10 px-5 py-3 text-[12px]  transition-all duration-150 ease-linear hover:text-primbuttn"
            onClick={handleCancel}
          >
            {cancelButtonText}
          </button>
          <button
            className="z-10 px-5 py-3 text-[12px] text-xs font-bold transition-all duration-150 ease-linear hover:text-primbuttn"
            onClick={handleSave}
          >
            {saveButtonText}
          </button>
        </div>
      )}

      <div
        className="relative flex w-56 justify-center gap-2 overflow-hidden bg-accent/20 py-5"
        style={{ height: `${height * 5 + 40}px` }}
      >
        <div
          className="pointer-events-none absolute left-0 right-0 z-10 mx-[10px] rounded-md bg-accent/80 "
          style={{
            top: `${height * 2 + 20}px`,
            height: `${height}px`,
          }}
        />
        <MinuteWheel {...params} />
        {seperator && (
          <div className="relative z-50 flex h-full items-center justify-center font-bold text-primary">
            :
          </div>
        )}
        <HourWheel {...params} />
        {use12Hours && <HourFormat {...params} />}
      </div>
    </div>
  );
}

export default TimePickerSelection;
