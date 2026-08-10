export type EstimateLine = {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
};

export type EstimateSummary = {
  subtotal: number;
  markupAmount: number;
  total: number;
};

export function calculateEstimate(
  lines: EstimateLine[],
  markupPercent: number,
): EstimateSummary {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.quantity * line.unitCost,
    0,
  );

  const safeMarkup = Math.max(0, markupPercent);
  const markupAmount = subtotal * (safeMarkup / 100);
  const total = subtotal + markupAmount;

  return {
    subtotal,
    markupAmount,
    total,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
