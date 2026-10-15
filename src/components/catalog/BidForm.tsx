'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Gavel, LoaderCircle } from 'lucide-react';
import { priceInUsd } from '@/modules/catalog/pricing';

export function BidForm({ auctionId, startingPriceJpy }: { auctionId: string; startingPriceJpy: number }) {
  const minimumUsd = priceInUsd(startingPriceJpy);
  const [amount, setAmount] = useState(String(minimumUsd));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/bids', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ auctionId, amount: Number(amount) }) });
      if (response.status === 401) { window.location.href = `/login?next=${encodeURIComponent(`/product/${auctionId}`)}`; return; }
      const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.error ?? 'No se pudo registrar tu puja.');
      setMessage('Puja registrada correctamente. ¡Mucha suerte!');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo registrar tu puja.'); }
    finally { setBusy(false); }
  }
  const submitted = message.startsWith('Puja registrada');
  return <form onSubmit={submit}><label className="form-field">Tu puja máxima en USD<input type="number" name="amount" min={minimumUsd} step="1" value={amount} onChange={(event) => setAmount(event.target.value)} required aria-describedby="bid-hint" /></label><p id="bid-hint" className="form-hint">Mínimo estimado: ${minimumUsd.toLocaleString('en-US')} USD. La puja se envía al vendedor en yenes.</p><button className="button-dark" disabled={busy || !amount || Number(amount) < minimumUsd}>{busy ? <LoaderCircle size={15} className="spinner-inline" /> : <Gavel size={15} />} {busy ? 'Registrando puja…' : 'Confirmar puja'}</button>{message && <p className={submitted ? 'form-success' : 'form-error'} role={submitted ? 'status' : 'alert'}>{message}</p>}{submitted && <Link className="bid-history-link" href="/bids">Consultar mis pujas <ArrowRight size={13} /></Link>}</form>;
}
