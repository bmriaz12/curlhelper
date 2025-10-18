/**
 * Core types for CurlHelper
 */

// Define RequestBody type for compatibility
export type RequestBody = string | Blob | ArrayBufferView | ArrayBuffer | FormData | URLSearchParams | ReadableStream<Uint8Array>;

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface RequestTiming {
  /** Total request time in milliseconds */
  total: number;
  /** DNS lookup time in milliseconds */
  dns?: number;
  /** TCP connection time in milliseconds */
  tcp?: number;
  /** TLS handshake time in milliseconds */
  tls?: number;
  /** Time to first byte in milliseconds */
  ttfb?: number;
  /** Request body send time in milliseconds */
  request?: number;
  /** Response body download time in milliseconds */
  response?: number;
}

export interface CurlResponse<T = any> {
  /** Parsed response data */
  data: T;
  /** HTTP status code */
  status: number;
  /** HTTP status text */
  statusText: string;
  /** Response headers */
  headers: Headers;
  /** Whether the response was successful (status 200-299) */
  ok: boolean;
  /** Request timing information */
  timing: RequestTiming;
  /** Original fetch Response object */
  raw: Response;
}

export interface RetryOptions {
  /** Number of retry attempts (default: 3) */
  count: number;
  /** Backoff strategy */
  backoff?: 'linear' | 'exponential';
  /** Initial delay in milliseconds (default: 1000) */
  delay?: number;
  /** Maximum delay in milliseconds (default: 30000) */
  maxDelay?: number;
  /** HTTP status codes to retry on (default: [408, 429, 500, 502, 503, 504]) */
  statusCodes?: number[];
  /** Callback before each retry */
  onRetry?: (attempt: number, error: Error) => void;
}

export interface RequestConfig {
  /** Request URL */
  url: string;
  /** HTTP method */
  method: HttpMethod;
  /** Request headers */
  headers: Headers;
  /** Request body */
  body?: RequestBody | object;
  /** Query parameters */
  query?: Record<string, string | number | boolean>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Follow redirects (default: true) */
  follow?: boolean;
  /** Maximum redirects to follow (default: 20) */
  maxRedirects?: number;
  /** Retry configuration */
  retry?: RetryOptions;
  /** Proxy URL */
  proxy?: string;
  /** AbortController signal */
  signal?: AbortSignal;
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor<T = any> = (response: CurlResponse<T>) => CurlResponse<T> | Promise<CurlResponse<T>>;

export interface Interceptors {
  request: {
    handlers: RequestInterceptor[];
    use: (handler: RequestInterceptor) => number;
    eject: (id: number) => void;
  };
  response: {
    handlers: ResponseInterceptor[];
    use: (handler: ResponseInterceptor) => number;
    eject: (id: number) => void;
  };
}

export interface FileUpload {
  /** Field name */
  name: string;
  /** File path or Buffer or Blob */
  file: string | Buffer | Blob;
  /** Original filename */
  filename?: string;
  /** MIME type */
  contentType?: string;
}

export interface CurlBuilder {
  /** Set a single header */
  header(key: string, value: string): CurlBuilder;
  /** Set multiple headers */
  headers(headers: Record<string, string>): CurlBuilder;
  /** Add query parameters */
  query(params: Record<string, string | number | boolean>): CurlBuilder;
  /** Set JSON body (automatically sets Content-Type) */
  json(data: any): CurlBuilder;
  /** Set form data body */
  form(data: Record<string, string>): CurlBuilder;
  /** Add file for multipart upload */
  file(name: string, file: string | Buffer | Blob, filename?: string): CurlBuilder;
  /** Set request timeout */
  timeout(ms: number): CurlBuilder;
  /** Configure retries */
  retry(count: number, options?: Omit<RetryOptions, 'count'>): CurlBuilder;
  /** Set basic authentication */
  auth(username: string, password: string): CurlBuilder;
  /** Set bearer token */
  bearer(token: string): CurlBuilder;
  /** Set proxy */
  proxy(url: string): CurlBuilder;
  /** Follow redirects */
  follow(max?: number): CurlBuilder;
  /** Enable streaming response */
  stream(): CurlBuilder;
  /** Set abort signal */
  abort(signal: AbortSignal): CurlBuilder;

  /** Execute GET request */
  get<T = any>(): Promise<CurlResponse<T>>;
  /** Execute POST request */
  post<T = any>(): Promise<CurlResponse<T>>;
  /** Execute PUT request */
  put<T = any>(): Promise<CurlResponse<T>>;
  /** Execute PATCH request */
  patch<T = any>(): Promise<CurlResponse<T>>;
  /** Execute DELETE request */
  delete<T = any>(): Promise<CurlResponse<T>>;
  /** Execute HEAD request */
  head(): Promise<CurlResponse<void>>;
  /** Execute OPTIONS request */
  options(): Promise<CurlResponse<void>>;
}

export interface CurlParseResult {
  url: string;
  method: HttpMethod;
  headers: Record<string, string>;
  body?: string;
  auth?: { username: string; password: string };
}
