export async function executeYAuctionsPurchase(auctionId: string) {
  if (!auctionId) return { success: false, externalReference: '' };
  if (process.env.YAUCTIONS_MODE === 'live') {
    throw new Error('El adaptador YAuctions requiere credenciales e integración aprobada.');
  }
  return { success: true, externalReference: `demo-jp-${auctionId}-${Date.now()}` };
}

export async function placeYAuctionsBid(auctionId: string, amount: number) {
  if (!auctionId || !Number.isFinite(amount) || amount <= 0) return { success: false };
  return { success: process.env.YAUCTIONS_MODE !== 'live' };
}
