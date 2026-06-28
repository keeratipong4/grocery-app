export function formatPrice(price: number): string {
  return '฿' + price.toLocaleString('th-TH');
}

export function calcDiscountedPrice(price: number, discount: number): number {
  return Math.round(price * (1 - discount / 100));
}
