/**
 * Format number as Indonesian Rupiah (IDR)
 * e.g., formatIDR(25000) => "Rp 25.000"
 */
export function formatIDR(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Parse IDR string to number
 * e.g., parseIDR("Rp 25.000") => 25000
 */
export function parseIDR(str: string): number {
  const cleaned = str.replace(/[^\d]/g, "");
  return parseInt(cleaned, 10) || 0;
}

/**
 * Generate a random share code for bills
 */
export function generateShareCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
