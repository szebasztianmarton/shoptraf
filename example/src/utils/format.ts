/** Format centesimal price integer to Hungarian display format (e.g. "3 499" Ft) */
export function formatPrice(price: number): string {
  return (price / 100)
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
