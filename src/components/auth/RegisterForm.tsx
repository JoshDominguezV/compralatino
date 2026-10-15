'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export function RegisterForm() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = new FormData(event.currentTarget);
      if (data.get('password') !== data.get('passwordConfirm')) { setError('Las contraseñas no coinciden.'); return; }
      const response = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: data.get('name'), email: data.get('email'), password: data.get('password') }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) { setError(body.error ?? 'No se pudo crear la cuenta.'); return; }
      const result = await signIn('credentials', { email: data.get('email'), password: data.get('password'), redirect: false });
      if (result?.error) { setError('Cuenta creada. Inicia sesión para continuar.'); return; }
      window.location.assign('/profile');
    } catch { setError('No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.'); }
    finally { setBusy(false); }
  }
  return <form className="auth-form" onSubmit={submit}><span className="section-kicker">Empieza tu próximo hallazgo</span><h1>Crea tu cuenta</h1><p>Tu puerta de entrada al mercado japonés.</p>
    <label className="form-field">Nombre completo<input type="text" name="name" autoComplete="name" minLength={2} maxLength={80} placeholder="¿Cómo te llamas?" required /></label>
    <label className="form-field">Correo electrónico<input type="email" name="email" autoComplete="email" placeholder="tu@correo.com" required /></label>
    <label className="form-field">Contraseña<input type="password" name="password" autoComplete="new-password" minLength={8} maxLength={72} placeholder="Mínimo 8 caracteres" required /></label>
    <label className="form-field">Confirmar contraseña<input type="password" name="passwordConfirm" autoComplete="new-password" minLength={8} maxLength={72} placeholder="Repite tu contraseña" required /></label>
    {error && <p className="form-error" role="alert">{error}</p>}<button className="button-primary" disabled={busy} aria-busy={busy}>{busy ? 'Creando tu cuenta…' : 'Crear cuenta gratis'}</button>
    <div className="auth-foot">¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link></div>
  </form>;
}
