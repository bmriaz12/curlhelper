/**
 * Utility functions for CurlHelper
 */

import type { RequestConfig } from './types';

/**
 * Build URL with query parameters
 */
export function buildUrl(url: string, query?: Record<string, string | number | boolean>): string {
  if (!query || Object.keys(query).length === 0) {
    return url;
  }

  const urlObj = new URL(url);
  Object.entries(query).forEach(([key, value]) => {
    urlObj.searchParams.append(key, String(value));
  });

  return urlObj.toString();
}

/**
 * Encode basic auth credentials
 */
export function encodeBasicAuth(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate backoff delay
 */
export function calculateBackoff(
  attempt: number,
  strategy: 'linear' | 'exponential' = 'exponential',
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number {
  let delay: number;

  if (strategy === 'linear') {
    delay = baseDelay * attempt;
  } else {
    // Exponential with jitter
    delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
    // Add jitter (±25%)
    const jitter = delay * 0.25 * (Math.random() - 0.5);
    delay += jitter;
  }

  return Math.min(Math.max(delay, 0), maxDelay);
}

/**
 * Check if status code is retryable
 */
export function isRetryableStatus(status: number, retryableCodes: number[] = [408, 429, 500, 502, 503, 504]): boolean {
  return retryableCodes.includes(status);
}

/**
 * Create timeout promise
 */
export function createTimeout(ms: number, signal?: AbortSignal): Promise<never> {
  return new Promise((_, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timeout after ${ms}ms`));
    }, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new Error('Request aborted'));
    });
  });
}

/**
 * Merge headers
 */
export function mergeHeaders(target: Headers, source: Record<string, string> | Headers): void {
  if (source instanceof Headers) {
    source.forEach((value, key) => {
      target.set(key, value);
    });
  } else {
    Object.entries(source).forEach(([key, value]) => {
      target.set(key, value);
    });
  }
}

/**
 * Parse content type
 */
export function parseContentType(headers: Headers): string | null {
  const contentType = headers.get('content-type');
  if (!contentType) return null;
  return contentType.split(';')[0].trim().toLowerCase();
}

/**
 * Determine if body should be JSON
 */
export function shouldParseJson(headers: Headers): boolean {
  const contentType = parseContentType(headers);
  return contentType === 'application/json' || contentType?.endsWith('+json') || false;
}

/**
 * Clone request config
 */
export function cloneConfig(config: RequestConfig): RequestConfig {
  return {
    ...config,
    headers: new Headers(config.headers),
    query: config.query ? { ...config.query } : undefined,
    retry: config.retry ? { ...config.retry } : undefined,
  };
}
