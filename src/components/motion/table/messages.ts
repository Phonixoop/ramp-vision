/** English defaults. Override per instance with `labels`. */
export const tableMessages = {
  empty: "No data",
  selectAll: "Select all rows",
  selectRow: "Select row {row}",
  cellLabel: "{column} for row {row}",
  columnOptions: "{column} column options",
  reorderColumn: "Reorder {column} column",
  resizeColumn: "Resize {column} column",
};

export type TableMessages = typeof tableMessages;

/** The resolved translator the root hands to its parts. */
export type TableTranslate = (
  key: keyof TableMessages,
  values?: Record<string, string | number>,
) => string;
