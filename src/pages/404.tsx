import Link from "next/link";
import React from "react";
import { NotFound404SVG } from "~/resources/notfound";
import BlurBackground from "~/ui/blur-backgrounds";
import Button from "~/ui/buttons";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <BlurBackground />
      <h1 className="text-4xl text-primary">صفحه مورد نظر پیدا نشد</h1>
      <NotFound404SVG />
      <Link
        className="rounded-xl bg-primary px-5 py-3 text-secondary hover:bg-secbuttn hover:text-accent"
        href={"/"}
      >
        برگرد به خانه
      </Link>
    </div>
  );
}
