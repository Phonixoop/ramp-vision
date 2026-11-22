/**
 * Default brush window size so x-axis category/date labels stay readable
 * without overlapping. Matches `BarXAxis` default `maxLabels`.
 */
export const DEFAULT_BRUSH_VISIBLE_POINTS = 12;

/** Inclusive start/end indices for a Recharts-style brush default window. */
export function resolveDefaultBrushIndices(
  dataLength: number,
  maxVisiblePoints: number = DEFAULT_BRUSH_VISIBLE_POINTS
): { startIndex: number; endIndex: number } {
  if (dataLength <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }
  const endIndex = dataLength - 1;
  const startIndex = Math.max(0, dataLength - maxVisiblePoints);
  return { startIndex, endIndex };
}

/**
 * Default brush selection favoring the trailing (most recent) window when
 * there are more points than can be labeled without overlap.
 */
export function resolveDefaultBrushSelection(
  data: Record<string, unknown>[],
  xAccessor: (d: Record<string, unknown>) => Date,
  fullExtent: [Date, Date] | null,
  maxVisiblePoints: number = DEFAULT_BRUSH_VISIBLE_POINTS
): { start: Date; end: Date } | null {
  if (!fullExtent || data.length === 0) {
    return null;
  }
  if (data.length <= maxVisiblePoints) {
    return { start: fullExtent[0], end: fullExtent[1] };
  }
  const { startIndex } = resolveDefaultBrushIndices(
    data.length,
    maxVisiblePoints
  );
  const startRow = data[startIndex];
  if (!startRow) {
    return { start: fullExtent[0], end: fullExtent[1] };
  }
  return { start: xAccessor(startRow), end: fullExtent[1] };
}

export function filterDataByXDomain(
  data: Record<string, unknown>[],
  xDomain: [Date, Date],
  xAccessor: (d: Record<string, unknown>) => Date
): Record<string, unknown>[] {
  const start = xDomain[0].getTime();
  const end = xDomain[1].getTime();
  const minTime = Math.min(start, end);
  const maxTime = Math.max(start, end);

  return data.filter((d) => {
    const time = xAccessor(d).getTime();
    return time >= minTime && time <= maxTime;
  });
}

export function resolveDataXExtent(
  data: Record<string, unknown>[],
  xAccessor: (d: Record<string, unknown>) => Date
): [Date, Date] | null {
  if (data.length === 0) {
    return null;
  }

  let minTime = Number.POSITIVE_INFINITY;
  let maxTime = Number.NEGATIVE_INFINITY;

  for (const point of data) {
    const time = xAccessor(point).getTime();
    if (time < minTime) {
      minTime = time;
    }
    if (time > maxTime) {
      maxTime = time;
    }
  }

  if (minTime === Number.POSITIVE_INFINITY) {
    return null;
  }

  return [new Date(minTime), new Date(maxTime)];
}

/** Brush track extent — optionally extends past the last data row (e.g. projections). */
export function resolveBrushTrackXExtent(
  data: Record<string, unknown>[],
  xAccessor: (d: Record<string, unknown>) => Date,
  xExtentMax?: Date
): [Date, Date] | null {
  const extent = resolveDataXExtent(data, xAccessor);
  if (!extent) {
    return null;
  }
  if (!xExtentMax || xExtentMax.getTime() <= extent[1].getTime()) {
    return extent;
  }
  return [extent[0], xExtentMax];
}
