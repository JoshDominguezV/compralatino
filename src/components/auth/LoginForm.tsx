'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export function LoginForm({ next = '/' }: { next?: string }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const data = new FormData(event.currentTarget);
      const result = await signIn('credentials', { email: data.get('email'), password: data.get('password'), mfaCode: data.get('mfaCode'), redirect: false });
      if (result?.error) { setError('Correo, contraseña o código de verificación incorrectos.'); return; }
      let redirectTo = '/';
      try {
        const target = new URL(next, window.location.origin);
        const path = `${target.pathname}${target.search}${target.hash}`;
        if (target.origin === window.location.origin && !path.startsWith('//') && !path.startsWith('/\\')) redirectTo = path;
      } catch { redirectTo = '/'; }
      window.location.assign(redirectTo);
    } catch { setError('No se pudo conectar. Revisa tu conexión e inténtalo de nuevo.'); }
    finally { setBusy(false); }
  }
  return <form className="auth-form" onSubmit={submit}>
    <div className="auth-form-head">
      <span className="section-kicker">Qué gusto verte de nuevo</span>
      <h1>Inicia sesión</h1>
      <p>Continúa explorando lo mejor de Japón.</p>
    </div>
    <label className="form-field">Correo electrónico<input type="email" name="email" autoComplete="email" placeholder="tu@correo.com" required /></label>
    <label className="form-field">Contraseña<input type="password" name="password" autoComplete="current-password" minLength={8} placeholder="Tu contraseña" required /></label>
    <label className="form-field">Código de verificación <span className="form-hint">(si tu cuenta usa MFA)</span><input type="text" name="mfaCode" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="Código de 6 dígitos" /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button-primary auth-submit" disabled={busy} aria-busy={busy}>{busy ? 'Validando…' : 'Entrar a mi cuenta'}</button>
    <div className="auth-foot">¿Aún no tienes cuenta? <Link href="/register">Regístrate gratis</Link></div>
  </form>;
}
