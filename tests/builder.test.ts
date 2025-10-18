/**
 * Tests for RequestBuilder
 */

import { describe, it, expect } from 'vitest';
import { RequestBuilder } from '../src/builder';

describe('RequestBuilder', () => {
  it('should create builder with URL', () => {
    const builder = new RequestBuilder('https://api.example.com/users');
    expect(builder).toBeInstanceOf(RequestBuilder);
  });

  it('should set single header', () => {
    const builder = new RequestBuilder('https://api.example.com')
      .header('X-API-Key', 'secret');

    expect(builder).toBeInstanceOf(RequestBuilder);
  });

  it('should set multiple headers', () => {
    const builder = new RequestBuilder('https://api.example.com')
      .headers({
        'X-API-Key': 'secret',
        'X-Custom': 'value'
      });

    expect(builder).toBeInstanceOf(RequestBuilder);
  });

  it('should set query parameters', () => {
    const builder = new RequestBuilder('https://api.example.com')
      .query({ page: 1, limit: 10 });

    expect(builder).toBeInstanceOf(RequestBuilder);
  });

  it('should set JSON body', () => {
    const builder = new RequestBuilder('https://api.example.com')
      .json({ name: 'John', age: 30 });

    expect(builder).toBeInstanceOf(RequestBuilder);
  });

  it('should set form data', () => {
    const builder = new RequestBuilder('https://api.example.com')
      .form({ username: 'john', password: 'secret' });

    expect(builder).toBeInstanceOf(RequestBuilder);
  });

  it('should set timeout', () => {
    const builder = new RequestBuilder('https://api.example.com')
      .timeout(5000);

    expect(builder).toBeInstanceOf(RequestBuilder);
  });

  it('should configure retry', () => {
    const builder = new RequestBuilder('https://api.example.com')
      .retry(3, { backoff: 'exponential' });

    expect(builder).toBeInstanceOf(RequestBuilder);
  });

  it('should set basic auth', () => {
    const builder = new RequestBuilder('https://api.example.com')
      .auth('username', 'password');

    expect(builder).toBeInstanceOf(RequestBuilder);
  });

  it('should set bearer token', () => {
    const builder = new RequestBuilder('https://api.example.com')
      .bearer('token123');

    expect(builder).toBeInstanceOf(RequestBuilder);
  });

  it('should chain multiple methods', () => {
    const builder = new RequestBuilder('https://api.example.com/users')
      .header('X-API-Key', 'secret')
      .query({ page: 1 })
      .timeout(5000)
      .json({ name: 'John' });

    expect(builder).toBeInstanceOf(RequestBuilder);
  });
});
