/**
 * Request and response interceptor system
 */

import type { Interceptors, RequestInterceptor, ResponseInterceptor } from './types';

class InterceptorManager {
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

  constructor() {
    this.request = {
      handlers: [],
      use: (handler: RequestInterceptor): number => {
        this.request.handlers.push(handler);
        return this.request.handlers.length - 1;
      },
      eject: (id: number): void => {
        if (this.request.handlers[id]) {
          // Replace with no-op to maintain indices
          this.request.handlers[id] = (config) => config;
        }
      },
    };

    this.response = {
      handlers: [],
      use: (handler: ResponseInterceptor): number => {
        this.response.handlers.push(handler);
        return this.response.handlers.length - 1;
      },
      eject: (id: number): void => {
        if (this.response.handlers[id]) {
          // Replace with no-op to maintain indices
          this.response.handlers[id] = (response) => response;
        }
      },
    };
  }

  /**
   * Clear all interceptors
   */
  clear(): void {
    this.request.handlers = [];
    this.response.handlers = [];
  }
}

// Global interceptor instance
export const interceptors: Interceptors = new InterceptorManager();
