import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";
import moment from "jalali-moment";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useSocket } from "~/context/socket.provider";

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  onLoadedMore?: (prevScrollHeight: number) => void;
  chatRef?: React.RefObject<HTMLDivElement>;
}

function noop() {}

export function useChatQuery({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
  onLoadedMore = noop,
  chatRef,
}: ChatQueryProps) {
  const { isConnected } = useSocket();
  const prevScrollHeightRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);
  const prevPagesLengthRef = useRef(0);

  async function fetchMessages({ pageParam = undefined }) {
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: {
          cursor: pageParam,
          [paramKey]: paramValue,
        },
      },
      { skipNull: true },
    );

    const res = await fetch(url);
    return res.json();
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: fetchMessages,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    refetchInterval: isConnected ? false : 5000,
    initialData: undefined,
  });

  function captureScrollPosition() {
    if (!chatRef?.current) return;

    prevScrollHeightRef.current = chatRef.current.scrollHeight;
    prevScrollTopRef.current = chatRef.current.scrollTop;
    shouldRestoreScrollRef.current = true;
  }

  function restoreScrollPosition() {
    if (!chatRef?.current) return;

    const prevScrollHeight = prevScrollHeightRef.current;
    const prevScrollTop = prevScrollTopRef.current;
    const currentScrollHeight = chatRef.current.scrollHeight;
    const heightDiff = currentScrollHeight - prevScrollHeight;

    if (heightDiff > 0) {
      chatRef.current.scrollTop = prevScrollTop + heightDiff;
    }
  }

  function fetchNextPageWithScroll() {
    if (chatRef?.current && hasNextPage) {
      captureScrollPosition();
    }

    return fetchNextPage();
  }

  useLayoutEffect(() => {
    if (!chatRef?.current) return;

    const currentPagesLength = data?.pages?.length ?? 0;
    const prevPagesLength = prevPagesLengthRef.current;

    if (shouldRestoreScrollRef.current && currentPagesLength > prevPagesLength) {
      restoreScrollPosition();
      shouldRestoreScrollRef.current = false;
      onLoadedMore(prevScrollHeightRef.current);
    }

    if (!isFetchingNextPage && currentPagesLength === prevPagesLength) {
      shouldRestoreScrollRef.current = false;
    }

    prevPagesLengthRef.current = currentPagesLength;
  }, [data?.pages?.length, chatRef, isFetchingNextPage, onLoadedMore]);

  const enrichedMessages = useMemo(() => {
    const result = [];
    let lastDate: string | null = null;

    data?.pages
      .flatMap((a) => a.items)
      .reverse()
      .forEach((message) => {
        const messageDate = moment(message.sentAt).format("YYYY-MM-DD");

        if (messageDate !== lastDate) {
          result.push({
            type: "date",
            data: { date: messageDate },
          });
          lastDate = messageDate;
        }

        result.push({
          type: "message",
          data: message,
        });
      });

    return result;
  }, [data]);

  return {
    enrichedMessages,
    data,
    fetchNextPage: fetchNextPageWithScroll,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  };
}
