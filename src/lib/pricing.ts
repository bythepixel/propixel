export function computePricingTotals(
  lineItems: { quantity: number; unitPrice: number }[],
  discountPercent: number,
) {
  const subtotal = lineItems.reduce((sum, li) => sum + li.quantity * li.unitPrice, 0);
  const discount = subtotal * (Math.min(100, Math.max(0, discountPercent)) / 100);
  const total = Math.max(0, subtotal - discount);
  return { subtotal, discount, total };
}
