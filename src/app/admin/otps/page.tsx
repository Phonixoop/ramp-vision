"use client";

import { useRef } from "react";
import { api } from "~/trpc/react";
import Button from "~/ui/buttons";
import { RefreshCw, KeyRound, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

function formatJalaliDateTime(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  // Keep Persian display aligned with the ISO timestamp line (UTC-based).
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toISOString();
}

async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to manual selection when clipboard API is blocked (e.g. HTTP).
    }
  }

  return false;
}

function selectTextContent(element: HTMLElement | null) {
  if (!element) return;

  const selection = window.getSelection();
  if (!selection) return;

  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}

export default function OtpPage() {
  const otpCodeRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isFetching, error, refetch } =
    api.otpUser.getAll.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const latest = data?.[0];

  async function handleCopyOtp() {
    if (!latest?.Otp) return;

    const copied = await copyText(latest.Otp);
    if (copied) {
      toast.success("کد OTP کپی شد");
      return;
    }

    selectTextContent(otpCodeRef.current);
    toast.info("کد انتخاب شد. برای کپی Ctrl+C را بزنید");
  }

  return (
    <div dir="rtl" className="flex min-h-screen flex-col gap-6  p-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-primary">
            <KeyRound className="h-7 w-7" />
            کد OTP رسا
          </h1>
          <Button
            onClick={() => void refetch()}
            disabled={isLoading || isFetching}
            isLoading={isFetching}
            className="gap-1 border border-primary/20 hover:bg-primary/20 "
          >
            <RefreshCw className="h-4 w-4" />{" "}
            <span className="text-sm text-primary">بروزرسانی</span>
          </Button>
        </div>

        <p className="text-sm text-primary/70">
          آخرین کد OTP از پایگاه RAMP_OTP برای درخواست{" "}
          <span className="font-mono text-xs">gui-manual-report</span>
        </p>

        {isLoading ? (
          <div className="py-12 text-center text-sm text-primary/60">
            در حال بارگذاری...
          </div>
        ) : error ? (
          <div className="border-pw-red-default/30 bg-pw-red-default/5 text-pw-red-default rounded-lg border p-4 text-sm">
            {error.message}
          </div>
        ) : !latest ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-8 text-center">
            <p className="text-sm text-primary/70">رکوردی یافت نشد</p>
          </div>
        ) : (
          <Button
            onClick={() => void handleCopyOtp()}
            className={cn(
              "bg-fourth group flex w-full flex-col gap-3 rounded-2xl border border-primary/15 p-6 text-right transition-colors",
              "cursor-pointer hover:border-accent/40 hover:bg-accent/5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            )}
            aria-label="کپی کد OTP"
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-xs font-medium text-primary/70">
                آخرین کد
              </span>
              <span className="flex items-center gap-1 text-xs text-primary/50 transition-colors group-hover:text-accent">
                <Copy className="h-3.5 w-3.5" />
                برای کپی کلیک کنید
              </span>
            </div>
            <div
              ref={otpCodeRef}
              className="w-full select-all font-mono text-4xl tracking-widest text-primary"
            >
              {latest.Otp}
            </div>
            <div className="flex w-full flex-col gap-1 text-sm text-primary/80">
              <span>
                تاریخ:{" "}
                <span className="font-medium text-primary">
                  {formatJalaliDateTime(latest.UpdatedAt)}
                </span>
              </span>
              <span className="break-all font-mono text-xs text-primary/60">
                timestamp: {formatTimestamp(latest.UpdatedAt)}
              </span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
