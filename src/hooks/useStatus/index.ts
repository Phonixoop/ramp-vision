"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { toast } from "sonner";

export default function useStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [userAgent, setUserAgent] = useState({
    isDesktop: true,
    agent: "",
  });

  const canUseDOM: boolean = !!(
    typeof window !== "undefined" &&
    typeof window.document !== "undefined" &&
    typeof window.document.createElement !== "undefined"
  );

  const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

  const handleOffline = () => {
    toast.error("آفلاین");
    setIsOnline(false);
  };

  const handleOnline = () => {
    setIsOnline(true);
  };

  useIsomorphicLayoutEffect(() => {
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      setUserAgent({
        isDesktop: false,
        agent: "",
      });
    } else {
      setUserAgent({
        isDesktop: true,
        agent: "",
      });
    }
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return { isOnline, isDesktop: userAgent.isDesktop };
}
