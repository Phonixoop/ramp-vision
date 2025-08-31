"use client";

import { TableCell } from "@tremor/react";
import { RefreshCwIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "~/components/shadcn/table";
import Button from "~/ui/buttons";
import ThreeDotsWave from "~/ui/loadings/three-dots-wave";
import { api } from "~/trpc/react";

export default function OtpPage() {
  const {
    data: otpUsers,
    isLoading,
    refetch,
    isFetching,
    isRefetching,
  } = api.otpUser.getAll.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Use Clipboard API if supported
      navigator.clipboard
        .writeText(text)
        .then(() => {
          console.log("Text copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    } else {
      // Fallback to older method if Clipboard API is not available
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";

      document.body.appendChild(textArea);
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          console.log("Fallback: Text copied to clipboard!");
        } else {
          console.error("Fallback: Failed to copy text.");
        }
      } catch (err) {
        console.error("Fallback: Error while copying text", err);
      } finally {
        // Check if element still exists before removing
        if (textArea.parentNode) {
          document.body.removeChild(textArea);
        }
      }
    }
  }
  if (isLoading) return <ThreeDotsWave />;

  return (
    <div className="flex h-screen w-full items-center justify-center text-primary">
      {" "}
      <div className="border-0 py-10 ">
        <Button
          onClick={() => {
            refetch();
          }}
          className="mx-auto gap-2 bg-secondary text-primary"
        >
          <RefreshCwIcon />
          <span>رفرش</span>
        </Button>
        {(isFetching || isRefetching || isLoading) && <ThreeDotsWave />}
        <div className="p-6">
          <h2 className="mb-4 text-xl font-bold text-primary">کاربران OTP</h2>
          <Table dir="rtl">
            <TableHeader>
              <TableRow className="border-primary text-center text-accent hover:bg-transparent">
                <TableHead className="text-center ">
                  نام و نام خانوادگی
                </TableHead>
                <TableHead className="text-center ">نام کامپیوتر</TableHead>
                <TableHead className="text-center ">شماره تلفن</TableHead>
                <TableHead className="text-center ">کد OTP</TableHead>
                <TableHead className="text-center ">تاریخ ایجاد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {otpUsers?.map((user) => (
                <TableRow
                  key={user.Id}
                  className=" cursor-pointer border-primary text-center text-primary hover:bg-primary/50"
                  onClick={() => {
                    copyToClipboard(user.OtpCode);
                    toast.info("کد کپی شد");
                  }}
                >
                  <TableCell>{user.NameFamily}</TableCell>
                  <TableCell>{user.PcName}</TableCell>
                  <TableCell>{user.PhoneNumber}</TableCell>
                  <TableCell>{user.OtpCode}</TableCell>
                  <TableCell>{user.CreatedAt ?? "نامشخص"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
