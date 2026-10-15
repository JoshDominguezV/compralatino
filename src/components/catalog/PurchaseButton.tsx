'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LoaderCircle, ShoppingBag } from 'lucide-react';

export function PurchaseButton({ productId, amountUsd, label = 'Comprar ahora' }: { productId: string; amountUsd: number; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [needsAddress, setNeedsAddress] = useState(false);
  const [message, setMessage] = useState('');
  async function buy() {
    setBusy(true); setMessage(''); setNeedsAddress(false);
    try {
      const response = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity: 1 }) });
      if (response.status === 401) { window.location.href = '/login?next=/product/' + productId; return; }
      const body = await response.json().catch(() => ({}));
      if (body.code === 'SHIPPING_ADDRESS_REQUIRED') { setNeedsAddress(true); setMessage(body.error); return; }
      if (!response.ok) throw new Error(body.error ?? 'No se pudo completar la compra.');
      router.push('/orders');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Inténtalo de nuevo.'); }
    finally { setBusy(false); }
  }
  if (confirming) return <div className="purchase-confirm" aria-live="polite"><strong>Confirma tu compra</strong><p>Se registrará una orden por <b>${amountUsd.toLocaleString('en-US')} USD</b>. El envío internacional e impuestos se cotizan por separado.</p>{message && <p className="form-error" role="alert">{message}</p>}{needsAddress && <Link className="purchase-address-link" href={`/profile?next=${encodeURIComponent(`/product/${productId}`)}`}>Agregar dirección de entrega</Link>}<div className="purchase-confirm-actions"><button className="button-outline" type="button" onClick={() => { setConfirming(false); setMessage(''); setNeedsAddress(false); }} disabled={busy}>Cancelar</button>{!needsAddress && <button className="button-primary" type="button" onClick={buy} disabled={busy}>{busy ? <><LoaderCircle size={16} className="animate-spin" /> Procesando</> : 'Confirmar compra'}</button>}</div></div>;
  return <button className="button-primary" type="button" onClick={() => setConfirming(true)}><ShoppingBag size={16} /> {label}</button>;
}
