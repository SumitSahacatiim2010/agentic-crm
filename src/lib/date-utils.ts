// BUG-044: Centralized ISO date formatting utility
// All dates in the CRM should use yyyy-mm-dd (ISO 8601) format

/**
 * Format a date string or Date object to ISO yyyy-mm-dd
 * Returns '—' for null/undefined/invalid values
 */
export function fmtDate(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const d = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(d.getTime())) return '—';
    return d.toISOString().slice(0, 10); // yyyy-mm-dd
}

/**
 * Format a date string or Date object to ISO yyyy-mm-dd HH:mm
 * Returns '—' for null/undefined/invalid values
 */
export function fmtDateTime(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const d = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(d.getTime())) return '—';
    const date = d.toISOString().slice(0, 10);
    const time = d.toISOString().slice(11, 16);
    return `${date} ${time}`;
}
