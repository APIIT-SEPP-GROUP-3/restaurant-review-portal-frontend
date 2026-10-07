export function formatRating(value: number | string | null): string {
  if (value === null) return "Not rated";
  const rating = Number(value);
  return Number.isFinite(rating) ? `${rating.toFixed(1)}/5` : "Not rated";
}
