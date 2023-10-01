import React, { useEffect, useState } from "react";
import { Portal } from "react-portal";
import TimePickerSelection from "./TimePickerSelection";
import Button from "~/ui/buttons";

function TimePicker({
  value: initialValue = undefined,
  cellHeight = 32,
  placeHolder = "انتخاب زمان",
  pickerDefaultValue = "10:00",
  onChange = (timeValue) => {},
  onFocus = () => {},
  onSave = () => {},
  onCancel = () => {},
  disabled = false,
  isOpen: initialIsOpenValue = false,
  required = false,
  cancelButtonText = "لغو",
  saveButtonText = "ثبت",
  controllers = true,
  seperator = true,
  id = null,
  use12Hours = false,
  onAmPmChange = () => {},
  name = null,
  onOpen = () => {},
  popupClassName = null,
  inputClassName = null,
}) {
  const [isOpen, setIsOpen] = useState(initialIsOpenValue);
  const [height, setHeight] = useState(cellHeight);

  const handleClick = () => {
    if (!isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "overlay";
    setIsOpen(!isOpen);
  };

  const handleFocus = () => {
    if (!isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "overlay";
    onFocus();
    onOpen();
  };

  let finalValue = initialValue;

  if (!initialValue && use12Hours) {
    finalValue = `${pickerDefaultValue} AM`;
  } else if (!initialValue && !use12Hours) {
    finalValue = pickerDefaultValue;
  }

  const params = {
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
    initialValue: finalValue,
    pickerDefaultValue,
  };

  return (
    <>
      <div className="w-40 text-center" onClick={handleClick}>
        <Button
          className={` w-full cursor-pointer rounded-xl border  border-accent bg-transparent p-2 `}
          disabled={disabled}
          onFocus={handleFocus}
        >
          {!finalValue ? placeHolder : finalValue}
        </Button>
      </div>
      {isOpen && !disabled && (
        <Portal>
          <div className="fixed inset-0  z-50 flex  items-end justify-center">
            <div className={`fixed inset-0 `} onClick={() => handleClick()} />
            <TimePickerSelection
              {...params}
              onSave={() => {
                if (!isOpen) document.body.style.overflow = "hidden";
                else document.body.style.overflow = "overlay";
                setIsOpen(false);
                onSave();
              }}
              onCancel={() => {
                if (!isOpen) document.body.style.overflow = "hidden";
                else document.body.style.overflow = "overlay";
                setIsOpen(false);
              }}
            />
          </div>
        </Portal>
      )}
    </>
  );
}

export default TimePicker;
