import React from "react";
import Button from "../";

export default function WarningButton({ ...rest }) {
  return <Button className={`bg-yellow-400  text-black`} {...rest} />;
}
