"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  LayoutGrid,
  List,
  Search,
  Table2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "~/components/arc/copy-button/copy-button";
import { MultiSelect } from "~/components/arc/multi-select/multi-select";
import { SplitButton } from "~/components/arc/split-button/split-button";
import SegmentedControl from "~/components/arc/segmented-control/segmented-control";
import { Button } from "~/components/shadcn/button";
import { Input } from "~/components/shadcn/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/shadcn/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
} from "~/components/shadcn/table";
import {
  Layout,
  ToolbarFilterField,
  ToolbarFilterPopover,
  ToolbarFilterSection,
} from "~/components/linear-shell";
import UseUserManager from "~/hooks/userManager";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { SetPersonnelDayOffWizard } from "~/app/dashboard/personnels/components/PersonnelsTable";
import {
  type FacetFilters,
  type PersonnelRecord,
  type SortKey,
  compareRows,
  displayLabel,
  downloadCsv,
  emptyFilters,
  filtersAreActive,
  formatNumber,
  initials,
  matchesFacets,
  readDateOptions,
  readRows,
  text,
  uniqueValues,
} from "./model";

const PAGE_SIZE = 25;
const GROUP_LIMIT = 8;
const INLINE_TRIGGER = "min-w-[132px] max-w-[180px]";
const PANEL_TRIGGER = "w-full";
const DEFAULT_ITEMS_PER_PAGE = 50;
const focusClass =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:[outline-color:rgb(var(--accent))]";

const sortColumns: { key: SortKey; label: string }[] = [
  { key: "NameFamily", label: "نام" },
  { key: "CityName", label: "استان" },
  { key: "Role", label: "سمت" },
  { key: "ContractType", label: "نوع قرارداد" },
  { key: "NationalCode", label: "کد ملی" },
];

export function PersonnelDirectory() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const searchId = useId();
  const { hasManagePersonnelAccess } = UseUserManager();
  const [filters, setFilters] = useState<FacetFilters>(emptyFilters);
  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [groupBy, setGroupBy] = useState<"role" | "city">("role");
  const [sortKey, setSortKey] = useState<SortKey>("NameFamily");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<PersonnelRecord | null>(null);

  const defaultDateQuery = api.personnel.getDefualtDateInfo.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const initialFiltersQuery = api.personnel.getInitialFilters.useQuery(
    undefined,
    { refetchOnWindowFocus: false },
  );

  const defaultDate =
    typeof defaultDateQuery.data === "string" ? defaultDateQuery.data : undefined;
  const activeDate = chosenDate ?? defaultDate;
  const dateOptions = useMemo(
    () => readDateOptions(initialFiltersQuery.data, defaultDate),
    [initialFiltersQuery.data, defaultDate],
  );

  const peopleQuery = api.personnel.getAll.useQuery(
    {
      filter: {
        CityName: [],
        ProjectType: [],
        Role: [],
        ContractType: [],
        RoleType: [],
        DateInfo: activeDate ? [activeDate] : [],
      },
    },
    { enabled: Boolean(activeDate), refetchOnWindowFocus: false },
  );

  const rows = useMemo(() => readRows(peopleQuery.data), [peopleQuery.data]);
  const filtered = useMemo(
    () => rows.filter((row) => matchesFacets(row, filters)),
    [rows, filters],
  );
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compareRows(a, b, sortKey, sortDir)),
    [filtered, sortKey, sortDir],
  );
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = sorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const cityOptions = useMemo(
    () => uniqueValues(rows, (row) => row.CityName),
    [rows],
  );
  const roleOptions = useMemo(
    () => uniqueValues(rows, (row) => row.Role),
    [rows],
  );
  const contractOptions = useMemo(
    () => uniqueValues(rows, (row) => row.ContractType),
    [rows],
  );
  const projectOptions = useMemo(
    () => uniqueValues(rows, (row) => row.ProjectType),
    [rows],
  );
  const roleTypeOptions = useMemo(
    () => uniqueValues(rows, (row) => row.RoleType),
    [rows],
  );

  const dateFailed =
    defaultDateQuery.isError ||
    (defaultDateQuery.isSuccess && typeof defaultDateQuery.data !== "string");
  const rowsFailed =
    peopleQuery.isError ||
    (peopleQuery.isSuccess && !Array.isArray(peopleQuery.data));
  const loading =
    (!activeDate && (defaultDateQuery.isLoading || defaultDateQuery.isFetching)) ||
    (Boolean(activeDate) && peopleQuery.isLoading);
  const failed = !loading && (dateFailed || rowsFailed);

  const liveText = loading
    ? "در حال بارگذاری فهرست پرسنل"
    : failed
      ? "بارگذاری فهرست ناموفق بود"
      : filtered.length === 0
        ? "نتیجه‌ای پیدا نشد"
        : `${formatNumber(filtered.length)} نفر`;

  const overflowActiveCount = [
    filters.contracts.length > 0,
    filters.roles.length > 0,
    filters.projects.length > 0,
    filters.roleTypes.length > 0,
  ].filter(Boolean).length;

  useEffect(() => {
    setPage(0);
  }, [filters, sortKey, sortDir, activeDate, view]);

  useEffect(() => {
    setExpanded({});
  }, [groupBy]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const element = target instanceof HTMLElement ? target : null;
      const tag = element?.tagName;
      const inField =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        element?.isContentEditable === true;
      if (
        event.key === "/" &&
        !inField &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (event.key !== "Escape") return;
      if (document.querySelector("[role='dialog']")) return;
      if (inField && element !== searchRef.current) return;
      if (!filters.query) return;
      event.preventDefault();
      setFilters((current) => ({ ...current, query: "" }));
      if (element === searchRef.current) searchRef.current?.blur();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filters.query]);

  function retry() {
    void defaultDateQuery.refetch();
    void initialFiltersQuery.refetch();
    void peopleQuery.refetch();
  }

  function exportRows() {
    if (!activeDate || filtered.length === 0) {
      toast.error("ردیفی برای خروجی وجود ندارد");
      return;
    }
    downloadCsv(filtered, activeDate);
    toast.success("فایل CSV آماده شد");
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir("asc");
  }

  function clearOverflowFilters() {
    setFilters((current) => ({
      ...current,
      contracts: [],
      roles: [],
      projects: [],
      roleTypes: [],
    }));
  }

  return (
    <div dir="rtl" className="flex min-h-0 flex-1 flex-col overflow-hidden text-primary">
      <Layout.TopBar>
        <Layout.TopBar.Title>پرسنل</Layout.TopBar.Title>
        <Layout.TopBar.Filters>
          <label className="flex shrink-0 items-center gap-1.5 text-xs text-primary/70">
            <span className="sr-only">تاریخ گزارش</span>
            <select
              aria-label="تاریخ گزارش"
              className={cn(
                "h-8 min-w-[140px] rounded-md border border-border-color/15 bg-third px-2 text-xs text-primary",
                focusClass,
              )}
              value={activeDate ?? ""}
              disabled={!activeDate || dateOptions.length === 0}
              onChange={(event) => setChosenDate(event.target.value)}
            >
              {dateOptions.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </label>
          <CompactSelect
            values={filters.cities}
            options={cityOptions}
            onChange={(cities) =>
              setFilters((current) => ({ ...current, cities }))
            }
            placeholder="استان"
            className={INLINE_TRIGGER}
            loading={loading}
          />
          <ToolbarFilterPopover
            activeFilterCount={overflowActiveCount}
            onClear={clearOverflowFilters}
            contentClassName="min-w-[520px]"
          >
            <ToolbarFilterSection title="فیلترهای بیشتر">
              <ToolbarFilterField label="سمت">
                <CompactSelect
                  values={filters.roles}
                  options={roleOptions}
                  onChange={(roles) =>
                    setFilters((current) => ({ ...current, roles }))
                  }
                  placeholder="سمت"
                  className={PANEL_TRIGGER}
                  loading={loading}
                />
              </ToolbarFilterField>
              <ToolbarFilterField label="نوع قرارداد">
                <CompactSelect
                  values={filters.contracts}
                  options={contractOptions}
                  onChange={(contracts) =>
                    setFilters((current) => ({ ...current, contracts }))
                  }
                  placeholder="نوع قرارداد"
                  className={PANEL_TRIGGER}
                  loading={loading}
                />
              </ToolbarFilterField>
              <ToolbarFilterField label="نوع پروژه">
                <CompactSelect
                  values={filters.projects}
                  options={projectOptions}
                  onChange={(projects) =>
                    setFilters((current) => ({ ...current, projects }))
                  }
                  placeholder="نوع پروژه"
                  className={PANEL_TRIGGER}
                  loading={loading}
                />
              </ToolbarFilterField>
              <ToolbarFilterField label="نوع سمت">
                <CompactSelect
                  values={filters.roleTypes}
                  options={roleTypeOptions}
                  onChange={(roleTypes) =>
                    setFilters((current) => ({ ...current, roleTypes }))
                  }
                  placeholder="نوع سمت"
                  className={PANEL_TRIGGER}
                  loading={loading}
                />
              </ToolbarFilterField>
            </ToolbarFilterSection>
          </ToolbarFilterPopover>
          <span className="truncate text-[11px] text-primary/55" aria-live="polite">
            {liveText}
          </span>
        </Layout.TopBar.Filters>
        <Layout.TopBar.Actions>
          <SplitButton
            label="خروجی CSV"
            menuLabel="سایر اقدام‌های خروجی"
            icon={<Download className="size-4" aria-hidden="true" />}
            onClick={exportRows}
            actions={[
              {
                label: "نسخه جدولی",
                icon: <Table2 className="size-4" aria-hidden="true" />,
                onSelect: () => router.push("/dashboard/personnels"),
              },
            ]}
          />
        </Layout.TopBar.Actions>
      </Layout.TopBar>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6">
          {loading ? (
            <DirectorySkeleton />
          ) : failed ? (
            <DirectoryError onRetry={retry} />
          ) : (
            <>
              <DirectoryToolbar
                searchId={searchId}
                searchRef={searchRef}
                filters={filters}
                setFilters={setFilters}
                view={view}
                setView={setView}
                groupBy={groupBy}
                setGroupBy={setGroupBy}
              />
              <FilterChips filters={filters} onChange={setFilters} />
              {filtered.length === 0 ? (
                <DirectoryEmpty
                  canClear={filtersAreActive(filters)}
                  onClear={() => setFilters(emptyFilters)}
                />
              ) : view === "grid" ? (
                <PersonnelGrid
                  rows={filtered}
                  groupBy={groupBy}
                  expanded={expanded}
                  onToggleGroup={(key) =>
                    setExpanded((current) => ({
                      ...current,
                      [key]: !current[key],
                    }))
                  }
                  onOpen={setSelected}
                />
              ) : (
                <PersonnelTable
                  rows={pageRows}
                  page={safePage}
                  pageCount={pageCount}
                  total={sorted.length}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={toggleSort}
                  onPage={setPage}
                  onOpen={setSelected}
                />
              )}
            </>
          )}
        </div>
      </div>

      <Sheet open={selected != null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent
          side="left"
          dir="rtl"
          className="w-full overflow-y-auto bg-secondary pr-12 text-primary sm:max-w-xl"
        >
          {selected ? (
            <ProfilePanel
              person={selected}
              canManage={hasManagePersonnelAccess}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CompactSelect({
  values,
  options,
  onChange,
  placeholder,
  singleSelect = false,
  className,
  loading,
  itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
}: {
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  singleSelect?: boolean;
  className?: string;
  loading?: boolean;
  itemsPerPage?: number;
}) {
  const mergedOptions = useMemo(() => {
    const labels = Array.from(new Set([...values, ...options].filter(Boolean)));
    return labels.map((label) => ({ value: label, label }));
  }, [values, options]);

  if (loading && mergedOptions.length === 0) {
    return (
      <div
        className={cn(
          "h-8 min-w-[132px] animate-pulse rounded-md border border-border-color/10 bg-third/60",
          className,
        )}
      />
    );
  }

  return (
    <MultiSelect
      label={placeholder}
      hideLabel
      size="sm"
      value={values}
      onValueChange={onChange}
      options={mergedOptions}
      placeholder={placeholder}
      singleSelect={singleSelect}
      itemsPerPage={itemsPerPage}
      maxVisible={1}
      className={cn(className)}
    />
  );
}

function DirectoryToolbar({
  searchId,
  searchRef,
  filters,
  setFilters,
  view,
  setView,
  groupBy,
  setGroupBy,
}: {
  searchId: string;
  searchRef: RefObject<HTMLInputElement | null>;
  filters: FacetFilters;
  setFilters: Dispatch<SetStateAction<FacetFilters>>;
  view: "grid" | "list";
  setView: (value: "grid" | "list") => void;
  groupBy: "role" | "city";
  setGroupBy: (value: "role" | "city") => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <SegmentedControl
          label="نحوه نمایش"
          value={view}
          onValueChange={(value) => {
            if (value === "grid" || value === "list") setView(value);
          }}
          options={[
            {
              value: "grid",
              label: "کارت‌ها",
              accessory: <LayoutGrid className="size-4" aria-hidden="true" />,
            },
            {
              value: "list",
              label: "فهرست",
              accessory: <List className="size-4" aria-hidden="true" />,
            },
          ]}
        />
        {view === "grid" ? (
          <SegmentedControl
            label="گروه‌بندی"
            value={groupBy}
            onValueChange={(value) => {
              if (value === "role" || value === "city") setGroupBy(value);
            }}
            options={[
              { value: "role", label: "سمت" },
              { value: "city", label: "استان" },
            ]}
          />
        ) : null}
      </div>
      <div className="relative min-w-0 max-w-xl">
        <label htmlFor={searchId} className="sr-only">
          جستجوی نام یا کد ملی
        </label>
        <Search
          className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-primary/50"
          aria-hidden="true"
        />
        <Input
          id={searchId}
          ref={searchRef}
          value={filters.query}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              query: event.target.value,
            }))
          }
          placeholder="نام یا کد ملی"
          className={cn("min-h-11 rounded-xl pe-12 ps-10", focusClass)}
        />
        <kbd className="pointer-events-none absolute end-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-primary/15 px-1.5 text-xs text-primary/60 sm:inline">
          /
        </kbd>
      </div>
    </div>
  );
}

function FilterChips({
  filters,
  onChange,
}: {
  filters: FacetFilters;
  onChange: Dispatch<SetStateAction<FacetFilters>>;
}) {
  const chips: { key: string; label: string; remove: () => void }[] = [];
  if (filters.query.trim()) {
    chips.push({
      key: "query",
      label: `جستجو: ${filters.query.trim()}`,
      remove: () => onChange((current) => ({ ...current, query: "" })),
    });
  }
  const groups: {
    field: keyof Pick<
      FacetFilters,
      "cities" | "contracts" | "roles" | "projects" | "roleTypes"
    >;
    title: string;
    empty: string;
  }[] = [
    { field: "cities", title: "استان", empty: "بدون استان" },
    { field: "contracts", title: "قرارداد", empty: "بدون قرارداد" },
    { field: "roles", title: "سمت", empty: "بدون سمت" },
    { field: "projects", title: "پروژه", empty: "بدون پروژه" },
    { field: "roleTypes", title: "نوع سمت", empty: "بدون نوع سمت" },
  ];
  for (const group of groups) {
    for (const value of filters[group.field]) {
      chips.push({
        key: `${group.field}-${value}`,
        label: `${group.title}: ${displayLabel(value, group.empty)}`,
        remove: () =>
          onChange((current) => ({
            ...current,
            [group.field]: current[group.field].filter((item) => item !== value),
          })),
      });
    }
  }
  if (chips.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className={cn(
            "inline-flex min-h-11 items-center gap-2 rounded-full border border-border-color/15 bg-fourth px-3 text-sm",
            focusClass,
          )}
        >
          <span>{chip.label}</span>
          <X className="size-3.5" aria-hidden="true" />
          <span className="sr-only">حذف فیلتر</span>
        </button>
      ))}
      <Button
        type="button"
        variant="outline"
        className={cn("min-h-11", focusClass)}
        onClick={() => onChange(emptyFilters)}
      >
        پاک کردن فیلترها
      </Button>
    </div>
  );
}

function PersonnelGrid({
  rows,
  groupBy,
  expanded,
  onToggleGroup,
  onOpen,
}: {
  rows: PersonnelRecord[];
  groupBy: "role" | "city";
  expanded: Record<string, boolean>;
  onToggleGroup: (key: string) => void;
  onOpen: (person: PersonnelRecord) => void;
}) {
  const groups = useMemo(() => {
    const map = new Map<string, PersonnelRecord[]>();
    for (const row of rows) {
      const key = groupBy === "role" ? row.Role : row.CityName;
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return [...map.entries()]
      .map(([key, people]) => ({
        key,
        label: displayLabel(
          key,
          groupBy === "role" ? "بدون سمت" : "بدون استان",
        ),
        people: [...people].sort((a, b) =>
          a.NameFamily.localeCompare(b.NameFamily, "fa"),
        ),
      }))
      .sort(
        (a, b) =>
          b.people.length - a.people.length || a.label.localeCompare(b.label, "fa"),
      );
  }, [rows, groupBy]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {groups.map((group) => {
        const open = expanded[group.key] === true;
        const visible = open ? group.people : group.people.slice(0, GROUP_LIMIT);
        const hidden = group.people.length - visible.length;
        return (
          <section key={group.key || group.label} className="flex flex-col gap-3">
            <h2 className="flex items-center justify-between gap-3 text-sm font-medium">
              <span>{group.label}</span>
              <span className="text-primary/60">
                {formatNumber(group.people.length)} نفر
              </span>
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((person, index) => (
                <li key={`${text(person.NationalCode)}-${person.CityName}-${index}`}>
                  <PersonCard person={person} onOpen={onOpen} />
                </li>
              ))}
            </ul>
            {group.people.length > GROUP_LIMIT ? (
              <button
                type="button"
                aria-expanded={open}
                onClick={() => onToggleGroup(group.key)}
                className={cn(
                  "min-h-11 self-start rounded-xl px-3 text-sm text-primary underline-offset-4 hover:underline",
                  focusClass,
                )}
              >
                {open
                  ? "نمایش کمتر"
                  : `نمایش ${formatNumber(hidden)} نفر دیگر`}
              </button>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function PersonCard({
  person,
  onOpen,
}: {
  person: PersonnelRecord;
  onOpen: (person: PersonnelRecord) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(person)}
      className={cn(
        "flex min-h-11 w-full flex-col gap-3 rounded-2xl border border-border-color/10 bg-fourth p-4 text-right transition-colors hover:border-border-color/25",
        focusClass,
      )}
    >
      <span className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primbuttn/20 text-sm font-semibold"
        >
          {initials(person.NameFamily)}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-medium">
            {person.NameFamily || "بدون نام"}
          </span>
          <span className="block truncate text-sm text-primary/70">
            {displayLabel(person.Role, "بدون سمت")}
          </span>
        </span>
      </span>
      <span className="flex items-center justify-between gap-2 text-sm">
        <span className="truncate text-primary/75">
          {displayLabel(person.CityName, "بدون استان")}
        </span>
        <span className="shrink-0 rounded-md border border-border-color/15 bg-third px-2 py-1 text-xs">
          {displayLabel(person.ContractType, "بدون قرارداد")}
        </span>
      </span>
    </button>
  );
}

function PersonnelTable({
  rows,
  page,
  pageCount,
  total,
  sortKey,
  sortDir,
  onSort,
  onPage,
  onOpen,
}: {
  rows: PersonnelRecord[];
  page: number;
  pageCount: number;
  total: number;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  onPage: (page: number) => void;
  onOpen: (person: PersonnelRecord) => void;
}) {
  return (
    <div className="flex flex-col gap-3 pb-8">
      <div className="overflow-hidden rounded-2xl border border-border-color/10 bg-fourth">
        <Table>
          <TableHeader>
            <tr className="border-b border-border-color/10">
              {sortColumns.map((column) => {
                const active = sortKey === column.key;
                const ariaSort = active
                  ? sortDir === "asc"
                    ? "ascending"
                    : "descending"
                  : "none";
                return (
                  <TableHead key={column.key} aria-sort={ariaSort} className="text-right text-primary">
                    <button
                      type="button"
                      onClick={() => onSort(column.key)}
                      className={cn(
                        "inline-flex min-h-11 items-center gap-1 rounded-md px-1 text-sm font-medium",
                        focusClass,
                      )}
                    >
                      {column.label}
                      {active ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="size-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="size-4" aria-hidden="true" />
                        )
                      ) : (
                        <ChevronsUpDown className="size-4 opacity-50" aria-hidden="true" />
                      )}
                    </button>
                  </TableHead>
                );
              })}
            </tr>
          </TableHeader>
          <TableBody>
            {rows.map((person, index) => (
              <tr
                key={`${text(person.NationalCode)}-${person.CityName}-${index}`}
                tabIndex={0}
                role="button"
                aria-label={`پرونده ${person.NameFamily || "بدون نام"}`}
                className={cn(
                  "cursor-pointer border-b border-border-color/10 hover:bg-primary/5",
                  focusClass,
                )}
                onClick={() => onOpen(person)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  onOpen(person);
                }}
              >
                <TableCell className="font-medium">
                  {person.NameFamily || "بدون نام"}
                </TableCell>
                <TableCell>{displayLabel(person.CityName, "بدون استان")}</TableCell>
                <TableCell>{displayLabel(person.Role, "بدون سمت")}</TableCell>
                <TableCell>
                  {displayLabel(person.ContractType, "بدون قرارداد")}
                </TableCell>
                <TableCell className="tabular-nums">
                  {text(person.NationalCode) || "—"}
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <p>
          صفحه {formatNumber(page + 1)} از {formatNumber(pageCount)}،{" "}
          {formatNumber(total)} نفر
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className={cn("min-h-11", focusClass)}
            disabled={page <= 0}
            onClick={() => onPage(page - 1)}
          >
            قبلی
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn("min-h-11", focusClass)}
            disabled={page >= pageCount - 1}
            onClick={() => onPage(page + 1)}
          >
            بعدی
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({
  person,
  canManage,
}: {
  person: PersonnelRecord;
  canManage: boolean;
}) {
  const code = text(person.NationalCode);
  return (
    <div className="flex flex-col gap-6">
      <SheetHeader className="items-start text-right">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-primbuttn/20 text-base font-semibold"
          >
            {initials(person.NameFamily)}
          </span>
          <div>
            <SheetTitle className="text-primary">
              {person.NameFamily || "بدون نام"}
            </SheetTitle>
            <SheetDescription>
              {displayLabel(person.CityName, "بدون استان")}
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>
      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border-color/10 p-3 sm:col-span-2">
          <div>
            <dt className="text-primary/70">کد ملی</dt>
            <dd className="mt-1 font-medium tabular-nums">{code || "ثبت نشده"}</dd>
          </div>
          <CopyButton
            value={code}
            label="کپی کد ملی"
            copiedLabel="کپی شد"
            errorLabel="کپی نشد"
            disabled={!code}
            onCopied={() => toast.success("کد ملی کپی شد")}
          />
        </div>
        <ProfileFact label="نوع قرارداد" value={displayLabel(person.ContractType, "ثبت نشده")} />
        <ProfileFact label="نوع سمت" value={displayLabel(person.RoleType, "ثبت نشده")} />
        <ProfileFact label="سمت" value={displayLabel(person.Role, "ثبت نشده")} />
        <ProfileFact label="نوع پروژه" value={displayLabel(person.ProjectType, "ثبت نشده")} />
        <ProfileFact label="تاریخ گزارش" value={displayLabel(person.DateInfo, "ثبت نشده")} />
      </dl>
      {canManage ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-medium">مرخصی</h2>
          <p className="text-sm text-primary/70">
            ثبت یا برداشتن مرخصی همین شخص، با تأیید داخل تقویم.
          </p>
          <div className="relative min-h-80">
            <SetPersonnelDayOffWizard
              personnel={{
                cityName: person.CityName,
                nameFamily: person.NameFamily,
                nationalCode: person.NationalCode as string,
                dateInfo: person.DateInfo,
              }}
            />
          </div>
        </section>
      ) : (
        <p className="rounded-xl border border-border-color/10 px-3 py-3 text-sm text-primary/75">
          ثبت مرخصی فقط برای مدیران پرسنل فعال است.
        </p>
      )}
    </div>
  );
}

function ProfileFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-color/10 p-3">
      <dt className="text-primary/70">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

function DirectorySkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4">
      <p className="sr-only">در حال بارگذاری</p>
      <div className="h-11 max-w-xl animate-pulse rounded-xl bg-primary/10 motion-reduce:animate-none" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl bg-primary/10 motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}

function DirectoryError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-2xl border border-border-color/10 bg-fourth p-6"
    >
      <h2 className="text-lg font-medium">بارگذاری ناموفق بود</h2>
      <p className="text-sm text-primary/75">
        فهرست پرسنل یا تاریخ گزارش دریافت نشد.
      </p>
      <Button type="button" className={cn("min-h-11", focusClass)} onClick={onRetry}>
        تلاش دوباره
      </Button>
    </div>
  );
}

function DirectoryEmpty({
  canClear,
  onClear,
}: {
  canClear: boolean;
  onClear: () => void;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border-color/20 p-6"
    >
      <h2 className="text-lg font-medium">نتیجه‌ای پیدا نشد</h2>
      <p className="text-sm text-primary/75">
        {canClear
          ? "با این فیلترها کسی در فهرست نیست."
          : "برای این تاریخ گزارشی ثبت نشده است."}
      </p>
      {canClear ? (
        <Button type="button" className={cn("min-h-11", focusClass)} onClick={onClear}>
          پاک کردن فیلترها
        </Button>
      ) : null}
    </div>
  );
}
