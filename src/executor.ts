/**
 * Request executor with retry logic and interceptors
 */

import type { CurlResponse, RequestConfig, RetryOptions } from './types';
import { interceptors } from './interceptors';
import { buildUrl, createTimeout, shouldParseJson, sleep, calculateBackoff, isRetryableStatus, cloneConfig } from './utils';

/**
 * Execute HTTP request with timing, retries, and interceptors
 */
export async function executeRequest<T>(config: RequestConfig, streaming: boolean = false): Promise<CurlResponse<T>> {
  // Apply request interceptors
  let processedConfig = cloneConfig(config);
  for (const interceptor of interceptors.request.handlers) {
    processedConfig = await interceptor(processedConfig);
  }

  const startTime = performance.now();
  let lastError: Error | null = null;

  // Determine retry configuration
  const retryConfig: RetryOptions = processedConfig.retry || { count: 0 };
  const maxAttempts = retryConfig.count + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await performRequest<T>(processedConfig, streaming, startTime);

      // Check if we should retry based on status code
      if (attempt < maxAttempts && retryConfig.statusCodes && isRetryableStatus(response.status, retryConfig.statusCodes)) {
        const delay = calculateBackoff(
          attempt,
          retryConfig.backoff,
          retryConfig.delay,
          retryConfig.maxDelay
        );

        if (retryConfig.onRetry) {
          retryConfig.onRetry(attempt, new Error(`HTTP ${response.status}`));
        }

        await sleep(delay);
        continue;
      }

      // Apply response interceptors
      let processedResponse = response;
      for (const interceptor of interceptors.response.handlers) {
        processedResponse = await interceptor(processedResponse);
      }

      return processedResponse;
    } catch (error) {
      lastError = error as Error;

      // Don't retry if we've reached max attempts
      if (attempt >= maxAttempts) {
        throw error;
      }

      // Calculate backoff delay
      const delay = calculateBackoff(
        attempt,
        retryConfig.backoff,
        retryConfig.delay,
        retryConfig.maxDelay
      );

      if (retryConfig.onRetry) {
        retryConfig.onRetry(attempt, lastError);
      }

      await sleep(delay);
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Perform single HTTP request
 */
async function performRequest<T>(
  config: RequestConfig,
  streaming: boolean,
  startTime: number
): Promise<CurlResponse<T>> {
  const url = buildUrl(config.url, config.query);

  // Prepare fetch options
  const fetchOptions: RequestInit = {
    method: config.method,
    headers: config.headers,
    redirect: config.follow ? 'follow' : 'manual',
    signal: config.signal,
  };

  // Prepare body
  if (config.body && config.method !== 'GET' && config.method !== 'HEAD') {
    if (typeof config.body === 'object' && !(config.body instanceof FormData) && !(config.body instanceof URLSearchParams)) {
      fetchOptions.body = JSON.stringify(config.body);
    } else {
      fetchOptions.body = config.body as any;
    }
  }

  // Create timeout promise if specified
  const timeoutPromise = config.timeout
    ? createTimeout(config.timeout, config.signal)
    : null;

  // Execute request with optional timeout
  const requestPromise = fetch(url, fetchOptions);
  const response = timeoutPromise
    ? await Promise.race([requestPromise, timeoutPromise])
    : await requestPromise;

  const endTime = performance.now();

  // Parse response body
  let data: T;
  if (streaming) {
    // Return raw response for streaming
    data = response as any;
  } else if (response.status === 204 || config.method === 'HEAD') {
    // No content
    data = undefined as any;
  } else if (shouldParseJson(response.headers)) {
    const text = await response.text();
    data = text ? JSON.parse(text) : undefined;
  } else {
    // Return as text for other content types
    data = (await response.text()) as any;
  }

  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    ok: response.ok,
    timing: {
      total: endTime - startTime,
    },
    raw: response,
  };
}

/**
 * Create abort controller with timeout
 */
export function createAbortController(timeout?: number): AbortController {
  const controller = new AbortController();

  if (timeout) {
    setTimeout(() => controller.abort(), timeout);
  }

  return controller;
}
