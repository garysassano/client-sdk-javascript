import {CredentialProvider} from '@gomomento/sdk-core';

export function convertToB64String(v: string | Uint8Array): string {
  if (typeof v === 'string') {
    return btoa(v);
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return btoa(String.fromCharCode.apply(null, v));
}

export function createCallMetadata(
  cacheName: string,
  timeoutMillis: number
): {cache: string; deadline: string} {
  const deadline = Date.now() + timeoutMillis;
  return {cache: cacheName, deadline: deadline.toString()};
}

export function getWebControlEndpoint(
  credentialProvider: CredentialProvider
): string {
  return `web.${credentialProvider.getControlEndpoint()}`;
}

export function getWebCacheEndpoint(
  credentialProvider: CredentialProvider
): string {
  return `web.${credentialProvider.getCacheEndpoint()}`;
}