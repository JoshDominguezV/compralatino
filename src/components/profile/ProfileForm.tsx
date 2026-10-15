'use client';

import { useState } from 'react';

export function ProfileForm({ initial, returnTo }: { initial: { name: string; shippingAddress: string; phone: string; taxId: string; mfaEnabled: boolean }; returnTo?: string }) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('');
    const formData = new FormData(event.currentTarget);
    const values = { ...Object.fromEntries(formData), mfaEnabled: formData.get('mfaEnabled') === 'true' };
    try {
      const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setMessage(data.error ?? 'No se pudo guardar el perfil.'); return; }
      setMessage('Tus datos quedaron guardados.');
      if (returnTo) window.setTimeout(() => window.location.assign(returnTo), 700);
    } catch { setMessage('No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit}><label className="form-field">Nombre completo<input name="name" defaultValue={initial.name} autoComplete="name" required minLength={2} maxLength={80} /></label><label className="form-field">Dirección de entrega<input name="shippingAddress" defaultValue={initial.shippingAddress} autoComplete="street-address" placeholder="Dirección, ciudad, país" minLength={8} maxLength={240} required /></label><label className="form-field">Teléfono<input name="phone" defaultValue={initial.phone} autoComplete="tel" maxLength={30} /></label><label className="form-field">NIT / identificación fiscal<input name="taxId" defaultValue={initial.taxId} maxLength={40} /></label><label style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '20px 0', fontSize: 12, color: '#505a54' }}><input type="checkbox" name="mfaEnabled" value="true" defaultChecked={initial.mfaEnabled} /> Activar verificación de dos pasos simulada</label><p style={{ color: '#858d87', fontSize: 10 }}>En el entorno demo el código MFA es 123456. En producción debe reemplazarse por un proveedor de autenticación.</p>{message && <p className={message.startsWith('Tus datos') ? 'form-success' : 'form-error'} role={message.startsWith('Tus datos') ? 'status' : 'alert'}>{message}</p>}<button className="button-dark" disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'}</button></form>;
}
