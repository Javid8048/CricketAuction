export const LAKH = 100000;
export const CRORE = 10000000;

export function formatRupees(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  if (amount >= CRORE) {
    const cr = amount / CRORE;
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2);
    return `₹${formatted} Cr`;
  } else if (amount >= LAKH) {
    const lakh = amount / LAKH;
    const formatted = lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1);
    return `₹${formatted} Lakh`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

export function formatShortRupees(amount: number | null | undefined): string {
  if (!amount) return '₹0';
  if (amount >= CRORE) {
    return `₹${(amount / CRORE).toFixed(1)} Cr`;
  }
  if (amount >= LAKH) {
    return `₹${(amount / LAKH).toFixed(0)} L`;
  }
  return `₹${amount}`;
}

export function getMinBidIncrement(currentBid: number): number {
  if (currentBid < 1 * CRORE) {
    return 10 * LAKH; // 10 Lakhs
  } else if (currentBid < 5 * CRORE) {
    return 20 * LAKH; // 20 Lakhs
  } else {
    return 25 * LAKH; // 25 Lakhs
  }
}
