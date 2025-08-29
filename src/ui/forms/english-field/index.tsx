import React from "react";
import TextField from "~/ui/forms/text-field";

// Function to format the value with commas (for numbers)

export function EnglishAndNumberField({ value, onValueChange, ...rest }) {
  // Handle change event
  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^a-zA-Z0-9]/g, ""); // Allow only English letters and numbers
    onValueChange(rawValue); // Update value in parent component
  };

  // Format the value (add commas for numbers)
  const formattedValue = value?.toString() || "";

  return (
    <TextField
      {...rest}
      isRtl={false}
      value={formattedValue}
      onChange={handleChange}
    />
  );
}
