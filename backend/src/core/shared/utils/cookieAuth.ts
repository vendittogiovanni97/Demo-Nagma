import type { CookieOptions } from 'express';
import { Request, Response } from 'express';

/**
 * SECURITY (Audit M2): gestione del cookie di sessione httpOnly.
 * Il token JWT non è più leggibile da JavaScript lato client: un XSS non può
 * esfiltrare la sessione. Il frontend invia automaticamente il cookie con
 * `credentials: 'include'`; l'header Authorization resta supportato per
 * script/CLI/test (non è una regressione).
 */

export const AUTH_COOKIE_NAME = 'nagma_session';

/** Durata del cookie: allineata al JWT_EXPIRY di default (7 giorni). */
const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function baseCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  // sameSite configurabile: 'lax' (default) copre il caso frontend/API sullo
  // stesso sito o via reverse-proxy same-origin. Per API su dominio separato
  // impostare AUTH_COOKIE_SAMESITE=none (richiede HTTPS/secure).
  const sameSite = (process.env.AUTH_COOKIE_SAMESITE as 'lax' | 'strict' | 'none') || 'lax';
  return {
    httpOnly: true,
    secure: isProduction || sameSite === 'none',
    sameSite,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
  };
}

/** Imposta il cookie di sessione httpOnly con il token firmato. */
export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, baseCookieOptions());
}

/** Rimuove il cookie di sessione (logout). */
export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, { ...baseCookieOptions(), maxAge: undefined });
}

/** Legge il token dal cookie di sessione, se presente. */
export function getCookieToken(req: Request): string | undefined {
  return req.cookies?.[AUTH_COOKIE_NAME];
}
