/**
 * CurlHelper - A powerful, curl-like HTTP client for JavaScript and TypeScript
 *
 * @example
 * ```typescript
 * import curl from 'curlhelper';
 *
 * // Simple GET request
 * const data = await curl('https://api.example.com/users').get();
 *
 * // POST with JSON
 * const result = await curl('https://api.example.com/users')
 *   .json({ name: 'John' })
 *   .post();
 *
 * // Parse and execute curl commands
 * import { fromCurl } from 'curlhelper';
 * const data = await fromCurl(`curl -X GET https://api.example.com/users`);
 * ```
 */

import { RequestBuilder } from './builder';
import { fromCurl as fromCurlParser, parse as parseCurlCommand } from './parser';
import { interceptors } from './interceptors';
import type {
  CurlResponse,
  CurlBuilder,
  HttpMethod,
  RequestConfig,
  RetryOptions,
  RequestInterceptor,
  ResponseInterceptor,
  Interceptors,
  FileUpload,
  RequestTiming,
  CurlParseResult,
} from './types';

/**
 * Create a new request builder
 *
 * @param url - The request URL
 * @returns RequestBuilder instance for chaining
 *
 * @example
 * ```typescript
 * const response = await curl('https://api.example.com/users')
 *   .header('Authorization', 'Bearer token')
 *   .query({ page: 1 })
 *   .get();
 * ```
 */
function curl(url: string): CurlBuilder {
  return new RequestBuilder(url);
}

/**
 * Shorthand for GET request
 */
curl.get = async <T = any>(url: string, config?: Partial<RequestConfig>): Promise<CurlResponse<T>> => {
  const builder = new RequestBuilder(url);
  if (config?.headers) builder.headers(config.headers as any);
  if (config?.query) builder.query(config.query);
  if (config?.timeout) builder.timeout(config.timeout);
  return builder.get<T>();
};

/**
 * Shorthand for POST request
 */
curl.post = async <T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<CurlResponse<T>> => {
  const builder = new RequestBuilder(url);
  if (config?.headers) builder.headers(config.headers as any);
  if (config?.timeout) builder.timeout(config.timeout);
  if (data) builder.json(data);
  return builder.post<T>();
};

/**
 * Shorthand for PUT request
 */
curl.put = async <T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<CurlResponse<T>> => {
  const builder = new RequestBuilder(url);
  if (config?.headers) builder.headers(config.headers as any);
  if (config?.timeout) builder.timeout(config.timeout);
  if (data) builder.json(data);
  return builder.put<T>();
};

/**
 * Shorthand for PATCH request
 */
curl.patch = async <T = any>(url: string, data?: any, config?: Partial<RequestConfig>): Promise<CurlResponse<T>> => {
  const builder = new RequestBuilder(url);
  if (config?.headers) builder.headers(config.headers as any);
  if (config?.timeout) builder.timeout(config.timeout);
  if (data) builder.json(data);
  return builder.patch<T>();
};

/**
 * Shorthand for DELETE request
 */
curl.delete = async <T = any>(url: string, config?: Partial<RequestConfig>): Promise<CurlResponse<T>> => {
  const builder = new RequestBuilder(url);
  if (config?.headers) builder.headers(config.headers as any);
  if (config?.timeout) builder.timeout(config.timeout);
  return builder.delete<T>();
};

/**
 * Global interceptors for all requests
 */
curl.interceptors = interceptors;

/**
 * Parse and execute a curl command string
 *
 * @param command - curl command string
 * @returns RequestBuilder for further chaining or execution
 *
 * @example
 * ```typescript
 * const response = await fromCurl(`
 *   curl -X POST https://api.example.com/users \
 *     -H "Content-Type: application/json" \
 *     -d '{"name":"John"}'
 * `).post();
 * ```
 */
interface FromCurlFunction {
  (command: string): CurlBuilder;
  parse: (command: string) => CurlParseResult;
}

export const fromCurl: FromCurlFunction = Object.assign(
  fromCurlParser,
  { parse: parseCurlCommand }
);

// Default export
export default curl;

// Named exports
export {
  // Main API
  curl,

  // Types
  type CurlResponse,
  type CurlBuilder,
  type HttpMethod,
  type RequestConfig,
  type RetryOptions,
  type RequestInterceptor,
  type ResponseInterceptor,
  type Interceptors,
  type FileUpload,
  type RequestTiming,
  type CurlParseResult,
};
