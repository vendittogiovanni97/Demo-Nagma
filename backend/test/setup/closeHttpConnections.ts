import http from 'node:http';
import https from 'node:https';

/**
 * Adapter HTTP senza keep-alive per i test di integrazione.
 * Il fetch nativo di Node usa un dispatcher globale che conserva socket/timer
 * oltre la fine della suite e fa apparire il falso positivo di Jest.
 */
globalThis.fetch = async (
  input: string | URL | Request,
  init: RequestInit = {}
): Promise<Response> => {
  const requestUrl = new URL(
    input instanceof Request ? input.url : input.toString()
  );
  const transport = requestUrl.protocol === 'https:' ? https : http;
  const headers = new Headers(input instanceof Request ? input.headers : undefined);
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  headers.set('Connection', 'close');

  const body = init.body == null
    ? undefined
    : typeof init.body === 'string' || Buffer.isBuffer(init.body)
      ? init.body
      : String(init.body);

  return new Promise<Response>((resolve, reject) => {
    const request = transport.request(
      requestUrl,
      {
        method: init.method ?? (input instanceof Request ? input.method : 'GET'),
        headers: Object.fromEntries(headers.entries()),
        agent: false,
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on('data', (chunk: Buffer) => chunks.push(chunk));
        response.on('end', () => {
          const status = response.statusCode ?? 500;
          // 204/205/304 non possono avere corpo: passarne uno fa lanciare il
          // costruttore di Response, e l'eccezione qui dentro lascerebbe la
          // promise sospesa per sempre invece di far fallire il test.
          const hasNullBody = status === 204 || status === 205 || status === 304;
          try {
            resolve(new Response(hasNullBody ? null : Buffer.concat(chunks), {
              status,
              statusText: response.statusMessage,
              headers: response.headers as HeadersInit,
            }));
          } catch (err) {
            reject(err);
          }
        });
      }
    );

    request.on('error', reject);
    init.signal?.addEventListener('abort', () => request.destroy(), { once: true });
    if (body !== undefined) request.write(body);
    request.end();
  });
};
