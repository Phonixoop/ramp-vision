import sql from 'mssql';
import type { ResolvedFilters } from '../lib/filters';

export type WhereClause = { text: string; params: Array<{ name: string; type: sql.ISqlTypeFactory; value: unknown }>; };

// Build a parameterized WHERE clause. No string concatenation with user data.
export function buildWhere(filters: ResolvedFilters): WhereClause {
  const parts: string[] = [];
  const params: WhereClause['params'] = [];

  if (filters.startDate) {
    parts.push('[Date] >= @startDate');
    params.push({ name: 'startDate', type: sql.Date, value: filters.startDate });
  }
  if (filters.endDate) {
    parts.push('[Date] <= @endDate');
    params.push({ name: 'endDate', type: sql.Date, value: filters.endDate });
  }

  if (Array.isArray(filters.ids) && filters.ids.length) {
    const names: string[] = [];
    filters.ids.forEach((v: string, i: number) => {
      const n = `id_${i}`;
      names.push(`@${n}`);
      params.push({ name: n, type: sql.VarChar(64), value: v });
    });
    parts.push(`[PersonId] IN (${names.join(', ')})`);
  }

  if (Array.isArray(filters.departments) && filters.departments.length) {
    const names: string[] = [];
    filters.departments.forEach((v: string, i: number) => {
      const n = `dept_${i}`;
      names.push(`@${n}`);
      params.push({ name: n, type: sql.VarChar(64), value: v });
    });
    parts.push(`[Department] IN (${names.join(', ')})`);
  }

  // When monthly, UI expects LIKE yyyy/MM/% pattern on a preformatted [PeriodKey] column.
  if (filters.period === 'monthly' && filters.startDate) {
    const d = new Date(filters.startDate);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const like = `${y}/${String(m).padStart(2, '0')}/%`;
    parts.push('[PeriodKey] LIKE @periodLike');
    params.push({ name: 'periodLike', type: sql.VarChar(16), value: like });
  }

  const text = parts.length ? `WHERE ${parts.join(' AND ')}` : '';
  return { text, params };
}

export function applyParams(req: sql.Request, wc: WhereClause) {
  for (const p of wc.params) {
    req.input(p.name, p.type, p.value as any);
  }
}

export async function getPool() {
  const connectionString = process.env.MSSQL_CONNECTION_STRING;
  if (!connectionString) throw new Error('MSSQL_CONNECTION_STRING is not set');
  const pool = await new sql.ConnectionPool(connectionString).connect();
  return pool;
}

export async function streamQuery(where: WhereClause, signal?: AbortSignal) {
  const pool = await getPool();
  const request = pool.request();
  request.stream = true;
  if (signal) {
    signal.addEventListener('abort', () => {
      try { request.cancel(); } catch {}
    });
  }
  applyParams(request, where);

  // Select the columns expected by the CSV export.
  const query = `
    SELECT [PersonId], [Department], [Date], [MetricA], [MetricB]
    FROM [dbo].[PersonnelPerformance]
    ${where.text}
    ORDER BY [PersonId], [Date]
  `;
  request.query(query);
  return request; // EventEmitter: 'recordset', 'row', 'error', 'done'
}

