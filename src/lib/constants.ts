export const DEFAULT_PROPOSAL_PRICE = 65000

export function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`
}
