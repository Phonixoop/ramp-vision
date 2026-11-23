/**
 * Permission → city-scope resolution, shared by the v1 tRPC routers and the v2
 * `/api/v2` route handlers.
 *
 * The rule that matters: a user sees only the cities granted by their
 * `ViewCities` sub-permissions, and *any* Tehran permission transparently
 * expands to every split Tehran city in the database (`Tehran`,
 * `Tehran Direct`, `Tehran Jobran`, …) because the data stores them separately
 * while the UI treats them as one province.
 */
import { TEHRAN_RELATED_CITIES } from "~/constants";
import type { Permission } from "~/types";

export type CityScope = {
  /** Cities the caller may query. Never empty for an authenticated user. */
  permittedCities: string[];
  /** True when the caller may see every city (only as a result of permissions). */
  unrestricted: boolean;
};

export function getActiveViewCityNames(permissions: Permission[]): string[] {
  const granted =
    permissions
      .find((permission) => permission.id === "ViewCities")
      ?.subPermissions?.filter((permission) => permission.isActive)
      .map((permission) => permission.enLabel) ?? [];

  return expandPermittedCities(granted);
}

/** Any Tehran permission also grants access to all split Tehran cities. */
export function expandPermittedCities(cities: string[]): string[] {
  const expanded = new Set(cities);

  if (cities.some((city) => isTehranRelatedCity(city))) {
    for (const city of TEHRAN_RELATED_CITIES) expanded.add(city);
  }

  return [...expanded];
}

export function isTehranRelatedCity(cityName: string): boolean {
  return TEHRAN_RELATED_CITIES.includes(
    cityName as (typeof TEHRAN_RELATED_CITIES)[number],
  );
}

/**
 * Intersect a requested city list with the caller's scope.
 * - No requested cities → the whole permitted scope.
 * - Requested cities outside the scope are dropped (never widened).
 * - If nothing requested survives, the intersection is empty and the caller
 *   must be denied rather than silently getting the whole scope back.
 */
export function resolveCityFilter(
  requested: string[] | null | undefined,
  permitted: string[],
): string[] {
  if (!permitted.length) return [];
  if (!requested?.length) return permitted;

  const allowed = new Set(permitted);
  return requested.filter((city) => allowed.has(city));
}

/** Cities from a permission list, plus the Tehran expansion. */
export function cityScopeFromPermissions(permissions: Permission[]): CityScope {
  const permittedCities = getActiveViewCityNames(permissions);
  return { permittedCities, unrestricted: false };
}

/**
 * `Tehran`-family grouping used by the city chart and by "Tehran counts as one
 * city" UI rules: the five Tehran cities collapse into a single `Tehran` label.
 */
export function normalizeCityForGrouping(cityName: string): string {
  return isTehranRelatedCity(cityName) ? "Tehran" : cityName;
}

export const TEHRAN_CITY_LIST = [...TEHRAN_RELATED_CITIES];
