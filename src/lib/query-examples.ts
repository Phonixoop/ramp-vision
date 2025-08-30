// Example usage of the new query builder abstraction
// This shows how much cleaner and more maintainable your queries can be

import { personnelQuery, query, aggregationQuery } from "./sql";

// Example 1: Your original complex query transformed into clean, readable code
export async function getPersonnelPerformanceExample() {
  // Instead of this messy string concatenation:
  // const baseQuery = `SELECT Distinct CityName,NameFamily,u.NationalCode...`;
  // const { text: whereClause, params } = buildWhere(queryFilter);
  // const query = `${baseQuery}${whereClause}${groupByClause}`;
  // const result = await queryWithParams(query, params);

  // You now have this clean, fluent API:
  const result = await personnelQuery()
    .withBasicFields() // Predefined fields for personnel
    .withPerformanceMetrics() // All performance aggregations
    .whereFilter({
      // Safe parameterized filtering
      CityName: ["Tehran", "Isfahan"],
      Start_Date: ["1403/01/01", "1403/01/31"],
      ProjectType: ["Type1", "Type2"],
    })
    .groupByPersonnel() // Predefined grouping
    .orderByCityName() // Predefined ordering
    .execute<any>();

  return result;
}

// Example 2: City performance aggregation
export async function getCityPerformanceExample() {
  // Clean, readable aggregation query
  const result = await personnelQuery()
    .withCityPerformance() // City-specific aggregations
    .withPerformanceMetrics() // All performance metrics
    .whereFilter({
      CityName: ["Tehran"],
      Start_Date: ["1403/01/01", "1403/01/31"],
    })
    .excludeDayOff() // Built-in day off exclusion
    .groupByCity() // City grouping
    .orderByCityAsc() // City ordering
    .execute<any>();

  return result;
}

// Example 3: Complex aggregation with custom conditions
export async function getComplexAggregationExample() {
  const result = await aggregationQuery()
    .select("CityName", "ProjectType")
    .sum("TotalPerformance", "TotalPerf")
    .avg("TotalPerformance", "AvgPerf")
    .count("*", "PersonnelCount")
    .from("RAMP_Daily.dbo.personnel_performance as p")
    .join(
      "JOIN RAMP_Daily.dbo.users_info as u ON p.NationalCode = u.NationalCode",
    )
    .where("HasTheDayOff = 0")
    .whereFilter({
      CityName: ["Tehran", "Isfahan"],
      Start_Date: ["1403/01/01", "1403/01/31"],
    })
    .groupBy("CityName", "ProjectType")
    .having("SUM(TotalPerformance) > 100")
    .orderBy("TotalPerf DESC")
    .execute<any>();

  return result;
}

// Example 4: Simple queries become even simpler
export async function getSimpleQueriesExample() {
  // Get all cities
  const cities = await query()
    .select("DISTINCT CityName")
    .from("RAMP_Daily.dbo.personnel_performance")
    .execute<any>();

  // Get latest date
  const latestDate = await query()
    .select("TOP 1 Start_Date")
    .from("RAMP_Daily.dbo.personnel_performance")
    .orderBy("Start_Date DESC")
    .execute<any>();

  // Get project types
  const projectTypes = await query()
    .select("DISTINCT ProjectType")
    .from("RAMP_Daily.dbo.users_info")
    .where("ProjectType IS NOT NULL AND ProjectType != ''")
    .execute<any>();

  return { cities, latestDate, projectTypes };
}

// Example 5: Dynamic query building
export async function getDynamicQueryExample(filters: Record<string, any>) {
  const queryBuilder = personnelQuery()
    .withBasicFields()
    .withPerformanceMetrics();

  // Add filters dynamically
  if (filters.cityName) {
    queryBuilder.whereFilter({ CityName: [filters.cityName] });
  }

  if (filters.dateRange) {
    queryBuilder.whereFilter({ Start_Date: filters.dateRange });
  }

  if (filters.excludeDayOff) {
    queryBuilder.excludeDayOff();
  }

  // Add grouping based on requirements
  if (filters.groupBy === "city") {
    queryBuilder.groupByCity();
  } else if (filters.groupBy === "personnel") {
    queryBuilder.groupByPersonnel();
  }

  return queryBuilder.execute<any>();
}

// Example 6: Chaining multiple conditions
export async function getChainedQueryExample() {
  const result = await personnelQuery()
    .withBasicFields()
    .withPerformanceMetrics()
    .where("HasTheDayOff = 0")
    .where("TotalPerformance > 50")
    .whereFilter({
      CityName: ["Tehran"],
      ProjectType: ["Type1"],
    })
    .groupByPersonnel()
    .orderBy("TotalPerformance DESC")
    .limit(10)
    .execute<any>();

  return result;
}

// Benefits of this abstraction:
// 1. Type Safety: Better IntelliSense and compile-time checking
// 2. Readability: Queries read like natural language
// 3. Maintainability: Changes are easier to make and understand
// 4. Reusability: Common patterns are predefined
// 5. Security: All queries are automatically parameterized
// 6. Flexibility: Still allows complex custom queries when needed
// 7. Consistency: All queries follow the same pattern
// 8. Debugging: Easier to debug and modify queries
