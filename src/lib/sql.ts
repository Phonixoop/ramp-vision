import sql from "mssql";

export async function queryWithParams<T>(
  text: string,
  params: Record<string, any>,
) {
  const request = new sql.Request();
  for (const [k, v] of Object.entries(params)) {
    // infer sql type if you want; basic is fine:
    request.input(k, v);
  }
  const result = await request.query<T>(text);
  return result.recordset;
}

// WHERE builder (arrays -> IN; dates -> LIKE patterns) returns { text, params }
export function buildWhere(filter: Record<string, unknown>) {
  const clauses: string[] = ["CityName is not NULL"]; // keep your baseline
  const params: Record<string, any> = {};

  // arrays -> IN (@k0,@k1,...)
  for (const [key, value] of Object.entries(filter)) {
    if (Array.isArray(value) && value.length) {
      const names = value.map((_, i) => `@${key}${i}`);
      value.forEach((v, i) => (params[`${key}${i}`] = v));
      clauses.push(`${key} IN (${names.join(",")})`);
    } else if (value != null && key !== "Start_Date") {
      params[key] = value;
      clauses.push(`${key} = @${key}`);
    }
  }

  // monthly Start_Date LIKE yyyy/mm/% safely
  if (Array.isArray(filter.Start_Date) && filter.Start_Date.length) {
    const likes: string[] = [];
    (filter.Start_Date as string[]).forEach((d, i) => {
      const [y, m] = d.split("/");
      const p = `StartLike${i}`;
      params[p] = `${y}/${m}/%`;
      likes.push(`Start_Date LIKE @${p}`);
    });
    likes.length && clauses.push(`(${likes.join(" OR ")})`);
  }

  return {
    text: clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "",
    params,
  };
}

// Query Builder Classes
export class QueryBuilder {
  protected selectFields: string[] = [];
  private fromTable: string = "";
  private joins: string[] = [];
  private whereConditions: string[] = [];
  private groupByFields: string[] = [];
  private orderByFields: string[] = [];
  private havingConditions: string[] = [];
  private limitCount?: number;
  protected params: Record<string, any> = {};

  select(...fields: string[]) {
    this.selectFields = fields;
    return this;
  }

  from(table: string) {
    this.fromTable = table;
    return this;
  }

  join(joinClause: string) {
    this.joins.push(joinClause);
    return this;
  }

  where(condition: string, params?: Record<string, any>) {
    this.whereConditions.push(condition);
    if (params) {
      Object.assign(this.params, params);
    }
    return this;
  }

  whereFilter(filter: Record<string, unknown>) {
    const { text, params } = buildWhere(filter);
    if (text) {
      this.whereConditions.push(text.replace("WHERE ", ""));
    }
    Object.assign(this.params, params);
    return this;
  }

  groupBy(...fields: string[]) {
    this.groupByFields = fields;
    return this;
  }

  orderBy(...fields: string[]) {
    this.orderByFields = fields;
    return this;
  }

  having(condition: string) {
    this.havingConditions.push(condition);
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  build(): { text: string; params: Record<string, any> } {
    let query = "SELECT ";

    if (this.selectFields.length > 0) {
      query += this.selectFields.join(", ");
    } else {
      query += "*";
    }

    query += ` FROM ${this.fromTable}`;

    if (this.joins.length > 0) {
      query += " " + this.joins.join(" ");
    }

    if (this.whereConditions.length > 0) {
      query += " WHERE " + this.whereConditions.join(" AND ");
    }

    if (this.groupByFields.length > 0) {
      query += " GROUP BY " + this.groupByFields.join(", ");
    }

    if (this.havingConditions.length > 0) {
      query += " HAVING " + this.havingConditions.join(" AND ");
    }

    if (this.orderByFields.length > 0) {
      query += " ORDER BY " + this.orderByFields.join(", ");
    }

    if (this.limitCount) {
      query += ` LIMIT ${this.limitCount}`;
    }

    return { text: query, params: this.params };
  }

  async execute<T>(): Promise<T[]> {
    const { text, params } = this.build();
    return queryWithParams<T>(text, params);
  }
}

// Aggregation Query Builder for complex aggregations
export class AggregationQueryBuilder extends QueryBuilder {
  private aggregations: string[] = [];

  sum(field: string, alias?: string) {
    const agg = `SUM(${field})${alias ? ` AS ${alias}` : ""}`;
    this.aggregations.push(agg);
    return this;
  }

  count(field: string = "*", alias?: string) {
    const agg = `COUNT(${field})${alias ? ` AS ${alias}` : ""}`;
    this.aggregations.push(agg);
    return this;
  }

  avg(field: string, alias?: string) {
    const agg = `AVG(${field})${alias ? ` AS ${alias}` : ""}`;
    this.aggregations.push(agg);
    return this;
  }

  max(field: string, alias?: string) {
    const agg = `MAX(${field})${alias ? ` AS ${alias}` : ""}`;
    this.aggregations.push(agg);
    return this;
  }

  min(field: string, alias?: string) {
    const agg = `MIN(${field})${alias ? ` AS ${alias}` : ""}`;
    this.aggregations.push(agg);
    return this;
  }

  build(): { text: string; params: Record<string, any> } {
    // Override select to include aggregations
    if (this.aggregations.length > 0) {
      this.selectFields = [...this.aggregations, ...this.selectFields];
    }
    return super.build();
  }
}

// Personnel Performance specific query builder
export class PersonnelQueryBuilder extends AggregationQueryBuilder {
  constructor() {
    super();
    this.from("RAMP_Daily.dbo.personnel_performance as p").join(
      "JOIN RAMP_Daily.dbo.users_info as u ON p.NationalCode = u.NationalCode",
    );
  }

  // Predefined aggregations for personnel performance
  withPerformanceMetrics() {
    return this.sum("SabtAvalieAsnad", "SabtAvalieAsnad")
      .sum("PazireshVaSabtAvalieAsnad", "PazireshVaSabtAvalieAsnad")
      .sum("ArzyabiAsanadBimarsetaniDirect", "ArzyabiAsanadBimarsetaniDirect")
      .sum("ArzyabiAsnadBimarestaniIndirect", "ArzyabiAsnadBimarestaniIndirect")
      .sum("ArzyabiAsnadDandanVaParaDirect", "ArzyabiAsnadDandanVaParaDirect")
      .sum("ArzyabiAsnadDandanDirect", "ArzyabiAsnadDandanDirect")
      .sum("ArzyabiAsnadDandanIndirect", "ArzyabiAsnadDandanIndirect")
      .sum(
        "ArzyabiAsnadDandanVaParaIndirect",
        "ArzyabiAsnadDandanVaParaIndirect",
      )
      .sum("ArzyabiAsnadDaroDirect", "ArzyabiAsnadDaroDirect")
      .sum("ArzyabiAsnadDaroIndirect", "ArzyabiAsnadDaroIndirect")
      .sum("WithScanCount", "WithScanCount")
      .sum("WithoutScanCount", "WithoutScanCount")
      .sum("WithoutScanInDirectCount", "WithoutScanInDirectCount")
      .sum("ArchiveDirectCount", "ArchiveDirectCount")
      .sum("ArchiveInDirectCount", "ArchiveInDirectCount")
      .sum("ArzyabiVisitDirectCount", "ArzyabiVisitDirectCount")
      .sum("ArzyabiVisitInDirectCount", "ArzyabiVisitInDirectCount")
      .sum("TotalPerformance", "TotalPerformance")
      .sum("DirectPerFormance", "DirectPerFormance")
      .sum("InDirectPerFormance", "InDirectPerFormance");
  }

  withBasicFields() {
    return this.select(
      "CityName",
      "NameFamily",
      "u.NationalCode",
      "ProjectType",
      "ContractType",
      "Role",
      "RoleType",
      "HasTheDayOff",
      "TownName",
      "BranchCode",
      "BranchName",
      "BranchType",
      "DateInfo",
      "Start_Date",
    );
  }

  withCityPerformance() {
    return this.select("CityName", "p.Start_Date")
      .count("*", "COUNT")
      .sum("TotalPerformance", "TotalPerformance")
      .sum("DirectPerFormance", "DirectPerFormance")
      .sum("InDirectPerFormance", "InDirectPerFormance");
  }

  excludeDayOff() {
    return this.where("HasTheDayOff = 0");
  }

  groupByPersonnel() {
    return this.groupBy(
      "CityName",
      "NameFamily",
      "u.NationalCode",
      "ProjectType",
      "ContractType",
      "Role",
      "RoleType",
      "DateInfo",
      "Start_Date",
      "HasTheDayOff",
      "TownName",
      "BranchCode",
      "BranchName",
      "BranchType",
    );
  }

  groupByCity() {
    return this.groupBy("CityName", "p.Start_Date");
  }

  orderByCityName() {
    return this.orderBy("CityName", "NameFamily");
  }

  orderByCityAsc() {
    return this.orderBy("CityName ASC");
  }
}

// Utility function to create a new personnel query
export function personnelQuery() {
  return new PersonnelQueryBuilder();
}

// Utility function to create a new general query
export function query() {
  return new QueryBuilder();
}

// Utility function to create a new aggregation query
export function aggregationQuery() {
  return new AggregationQueryBuilder();
}
