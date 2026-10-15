export const yenToUsd = Number(process.env.NEXT_PUBLIC_JPY_TO_USD ?? 0.0067);
export const priceInUsd = (yen: number) => Math.ceil(yen * yenToUsd * 1.12);
export const usdToYen = (usd: number) => Math.floor(usd / (yenToUsd * 1.12));
