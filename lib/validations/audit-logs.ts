/** Returns an error message, or null if the date range is valid. Dates are YYYY-MM-DD. */
export function validateDateRange(
  from: string,
  to: string,
  today: string
): string | null {
  if (from && to && from > to) {
    return "Start date must be on or before the end date.";
  }

  if ((from && from > today) || (to && to > today)) {
    return "Date range cannot include a future date.";
  }

  return null;
}
