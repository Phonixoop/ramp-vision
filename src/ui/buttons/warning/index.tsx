"use client";

import React from "react";
import Button from "../";

interface WarningButtonProps {
  children?: React.ReactNode;
  [key: string]: any;
}

export default function WarningButton({ 
  children,
  ...rest 
}: WarningButtonProps) {
  return <Button className={`bg-yellow-400  text-black`} {...rest}>{children}</Button>;
}
