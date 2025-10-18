/**
 * Fluent API builder for CurlHelper
 */

import type {
  CurlBuilder,
  CurlResponse,
  HttpMethod,
  RequestConfig,
  RetryOptions,
  FileUpload,
} from './types';
import { executeRequest } from './executor';
import { mergeHeaders, encodeBasicAuth } from './utils';

export class RequestBuilder implements CurlBuilder {
  private config: RequestConfig;
  private files: FileUpload[] = [];
  private isStreaming = false;

  constructor(url: string) {
    this.config = {
      url,
      method: 'GET',
      headers: new Headers({
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'curlhelper/0.1.0',
      }),
      follow: true,
      maxRedirects: 20,
    };
  }

  header(key: string, value: string): this {
    this.config.headers.set(key, value);
    return this;
  }

  headers(headers: Record<string, string>): this {
    mergeHeaders(this.config.headers, headers);
    return this;
  }

  query(params: Record<string, string | number | boolean>): this {
    this.config.query = { ...this.config.query, ...params };
    return this;
  }

  json(data: any): this {
    this.config.body = data;
    this.config.headers.set('Content-Type', 'application/json');
    return this;
  }

  form(data: Record<string, string>): this {
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    this.config.body = formData;
    this.config.headers.set('Content-Type', 'application/x-www-form-urlencoded');
    return this;
  }

  file(name: string, file: string | Buffer | Blob, filename?: string): this {
    this.files.push({ name, file, filename });
    return this;
  }

  timeout(ms: number): this {
    this.config.timeout = ms;
    return this;
  }

  retry(count: number, options?: Omit<RetryOptions, 'count'>): this {
    this.config.retry = { count, ...options };
    return this;
  }

  auth(username: string, password: string): this {
    const authHeader = encodeBasicAuth(username, password);
    this.config.headers.set('Authorization', authHeader);
    return this;
  }

  bearer(token: string): this {
    this.config.headers.set('Authorization', `Bearer ${token}`);
    return this;
  }

  proxy(url: string): this {
    this.config.proxy = url;
    return this;
  }

  follow(max: number = 20): this {
    this.config.follow = true;
    this.config.maxRedirects = max;
    return this;
  }

  stream(): this {
    this.isStreaming = true;
    return this;
  }

  abort(signal: AbortSignal): this {
    this.config.signal = signal;
    return this;
  }

  private async execute<T>(method: HttpMethod): Promise<CurlResponse<T>> {
    this.config.method = method;

    // Handle file uploads
    if (this.files.length > 0) {
      await this.prepareMultipartBody();
    }

    return executeRequest<T>(this.config, this.isStreaming);
  }

  private async prepareMultipartBody(): Promise<void> {
    const formData = new FormData();

    // Add existing body data if it's an object
    if (this.config.body && typeof this.config.body === 'object' && !(this.config.body instanceof FormData)) {
      const bodyObj = this.config.body as Record<string, any>;
      Object.entries(bodyObj).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    // Add files
    for (const upload of this.files) {
      if (typeof upload.file === 'string') {
        // File path - in Node.js environment
        if (typeof process !== 'undefined' && process.versions?.node) {
          const fs = await import('fs');
          const path = await import('path');
          const buffer = await fs.promises.readFile(upload.file);
          const filename = upload.filename || path.basename(upload.file);
          const blob = new Blob([buffer]);
          formData.append(upload.name, blob, filename);
        } else {
          throw new Error('File path uploads are only supported in Node.js environment');
        }
      } else if (upload.file instanceof Buffer) {
        const blob = new Blob([upload.file]);
        formData.append(upload.name, blob, upload.filename || 'file');
      } else {
        formData.append(upload.name, upload.file, upload.filename);
      }
    }

    this.config.body = formData;
    // Remove Content-Type to let browser/Node set it with boundary
    this.config.headers.delete('Content-Type');
  }

  get<T = any>(): Promise<CurlResponse<T>> {
    return this.execute<T>('GET');
  }

  post<T = any>(): Promise<CurlResponse<T>> {
    return this.execute<T>('POST');
  }

  put<T = any>(): Promise<CurlResponse<T>> {
    return this.execute<T>('PUT');
  }

  patch<T = any>(): Promise<CurlResponse<T>> {
    return this.execute<T>('PATCH');
  }

  delete<T = any>(): Promise<CurlResponse<T>> {
    return this.execute<T>('DELETE');
  }

  head(): Promise<CurlResponse<void>> {
    return this.execute<void>('HEAD');
  }

  options(): Promise<CurlResponse<void>> {
    return this.execute<void>('OPTIONS');
  }
}
