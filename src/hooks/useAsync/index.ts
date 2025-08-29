"use client";

import { useCallback, useEffect, useState } from "react";

interface UseAsyncReturn<T> {
  loading: boolean;
  error: Error | undefined;
  value: T | undefined;
}

export default function useAsync<T>(
  callback: () => Promise<T>,
  dependencies: React.DependencyList = [],
): UseAsyncReturn<T> {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [value, setValue] = useState<T | undefined>();

  const callbackMemoized = useCallback(() => {
    setLoading(true);
    setError(undefined);
    setValue(undefined);
    callback()
      .then(setValue)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [callback, ...dependencies]);

  useEffect(() => {
    callbackMemoized();
  }, [callbackMemoized]);

  return { loading, error, value };
}
