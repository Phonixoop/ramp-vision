"use client";

import Link from "next/link";
import Button from "~/ui/buttons";

interface LinkButtonProps {
  children: React.ReactNode;
  href?: string;
  [key: string]: any;
}

export default function LinkButton({ 
  children, 
  href = "", 
  ...rest 
}: LinkButtonProps) {
  return (
    <>
      <Link href={href} passHref>
        <a>
          <Button {...rest}>{children}</Button>
        </a>
      </Link>
    </>
  );
}
