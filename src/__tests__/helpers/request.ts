import { NextRequest } from 'next/server';

export function makeReq(
  method: string,
  path: string,
  options: { body?: unknown; cookies?: Record<string, string> } = {}
): NextRequest {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (options.cookies) {
    headers.set(
      'cookie',
      Object.entries(options.cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join('; ')
    );
  }
  return new NextRequest(`http://localhost:3000${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

export function getSetCookie(res: Response, name: string): string | null {
  const raw = res.headers.get('set-cookie') ?? '';
  const match = raw.match(new RegExp(`(?:^|,\\s*)${name}=([^;,]+)`));
  return match ? match[1] : null;
}

export function sessionCookie(token: string): Record<string, string> {
  return { 'farmart-session': token };
}
