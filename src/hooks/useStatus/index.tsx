import { useState, useEffect, useLayoutEffect } from "react";
import { toast } from "~/components/ui/toast/use-toast";

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

  useIsomorphicLayoutEffect(() => {
    window.addEventListener("offline", () => {
      setIsOnline(false);
    });
    window.addEventListener("online", () => {
      setIsOnline(true);
    });
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
      window.removeEventListener("offline", () => {
        toast({
          title: "آفلاین",
        });
        setIsOnline(false);
      });
      window.removeEventListener("online", () => {
        setIsOnline(true);
      });
    };
  }, []);

  return { isOnline, isDesktop: userAgent.isDesktop };
}
