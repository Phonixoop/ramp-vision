"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import * as Comlink from 'comlink';

type RawFilters = Record<string, unknown>;
type ResolvedFilters = Record<string, unknown>;

type Results = {
  validOptions?: Record<string, unknown>;
  footerTotals?: Record<string, number>;
  chartSeriesArrow?: ArrayBuffer;
  tableWindowArrow?: ArrayBuffer;
};

type ViewKind = 'table' | 'charts' | 'table+charts';

type WorkerAPI = import('../workers/data.worker').DataWorker;

type State = {
  rawFilters: RawFilters;
  resolvedFilters?: ResolvedFilters;
  results?: Results;
  isLoading: boolean;
};

type Ctx = State & {
  setFilter: (key: string, value: unknown) => void;
  applyFilters: (view: ViewKind) => Promise<void>;
  exportCSV: () => Promise<void>;
  initData: (buffer: ArrayBuffer) => Promise<void>;
};

const PersonnelContext = createContext<Ctx | null>(null);

export const usePersonnel = (): Ctx => {
  const ctx = useContext(PersonnelContext);
  if (!ctx) throw new Error('usePersonnel must be used within <PersonnelProvider>');
  return ctx;
};

function createWorker(): Comlink.Remote<WorkerAPI> {
  const worker = new Worker(new URL('../workers/data.worker.ts', import.meta.url), {
    type: 'module',
    name: 'personnel-data-worker',
  });
  return Comlink.wrap<WorkerAPI>(worker);
}

export const PersonnelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rawFilters, setRawFilters] = useState<RawFilters>({});
  const [resolvedFilters, setResolvedFilters] = useState<ResolvedFilters | undefined>(undefined);
  const [results, setResults] = useState<Results | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const workerRef = useRef<Comlink.Remote<WorkerAPI> | null>(null);

  const ensureWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = createWorker();
    }
    return workerRef.current;
  }, []);

  const setFilter = useCallback((key: string, value: unknown) => {
    setRawFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const initData = useCallback(async (buffer: ArrayBuffer) => {
    const w = ensureWorker();
    await w.init(Comlink.transfer(buffer, [buffer]));
  }, [ensureWorker]);

  const applyFilters = useCallback(async (view: ViewKind) => {
    setIsLoading(true);
    try {
      const w = ensureWorker();
      const { resolvedFilters: rf, results } = await w.applyFilters(rawFilters, view);
      setResolvedFilters(rf);
      setResults(results);
    } finally {
      setIsLoading(false);
    }
  }, [ensureWorker, rawFilters]);

  const exportCSV = useCallback(async () => {
    const w = ensureWorker();
    const rf = resolvedFilters ?? rawFilters;

    // Example: stream into a Blob and trigger download client-side.
    const chunks: string[] = [];
    await w.exportCSV(rf, Comlink.proxy((chunk: string) => {
      chunks.push(chunk);
    }));
    const blob = new Blob(chunks, { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'personnel.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [ensureWorker, resolvedFilters, rawFilters]);

  const value = useMemo<Ctx>(() => ({
    rawFilters,
    resolvedFilters,
    results,
    isLoading,
    setFilter,
    applyFilters,
    exportCSV,
    initData,
  }), [rawFilters, resolvedFilters, results, isLoading, setFilter, applyFilters, exportCSV, initData]);

  return (
    <PersonnelContext.Provider value={value}>
      {children}
    </PersonnelContext.Provider>
  );
};

