/**
 * Tests for curl command parser
 */

import { describe, it, expect } from 'vitest';
import { parse } from '../src/parser';

describe('Curl Parser', () => {
  it('should parse simple GET request', () => {
    const result = parse('curl https://api.example.com/users');
    expect(result.url).toBe('https://api.example.com/users');
    expect(result.method).toBe('GET');
  });

  it('should parse POST request with -X flag', () => {
    const result = parse('curl -X POST https://api.example.com/users');
    expect(result.url).toBe('https://api.example.com/users');
    expect(result.method).toBe('POST');
  });

  it('should parse headers', () => {
    const result = parse(`curl -H "Authorization: Bearer token" -H "Content-Type: application/json" https://api.example.com`);
    expect(result.headers['Authorization']).toBe('Bearer token');
    expect(result.headers['Content-Type']).toBe('application/json');
  });

  it('should parse JSON body', () => {
    const result = parse(`curl -X POST https://api.example.com/users -d '{"name":"John"}'`);
    expect(result.body).toBe('{"name":"John"}');
    expect(result.method).toBe('POST');
  });

  it('should parse basic auth', () => {
    const result = parse('curl -u username:password https://api.example.com');
    expect(result.auth).toEqual({ username: 'username', password: 'password' });
  });

  it('should handle line continuations', () => {
    const result = parse(`curl -X POST https://api.example.com/users \\
      -H "Content-Type: application/json" \\
      -d '{"name":"John"}'`);
    expect(result.url).toBe('https://api.example.com/users');
    expect(result.method).toBe('POST');
    expect(result.headers['Content-Type']).toBe('application/json');
  });

  it('should parse --request long flag', () => {
    const result = parse('curl --request PUT https://api.example.com/users/1');
    expect(result.method).toBe('PUT');
  });

  it('should parse --header long flag', () => {
    const result = parse('curl --header "X-API-Key: secret" https://api.example.com');
    expect(result.headers['X-API-Key']).toBe('secret');
  });

  it('should parse --data flag', () => {
    const result = parse('curl --data "name=John&age=30" https://api.example.com/users');
    expect(result.body).toBe('name=John&age=30');
    expect(result.method).toBe('POST');
  });

  it('should parse user agent', () => {
    const result = parse('curl -A "CustomAgent/1.0" https://api.example.com');
    expect(result.headers['User-Agent']).toBe('CustomAgent/1.0');
  });

  it('should handle complex real-world curl command', () => {
    const result = parse(`
      curl -X POST https://api.github.com/repos/owner/repo/issues \\
        -H "Accept: application/vnd.github+json" \\
        -H "Authorization: Bearer ghp_token" \\
        -H "X-GitHub-Api-Version: 2022-11-28" \\
        -d '{"title":"Bug report","body":"Description","labels":["bug"]}'
    `);

    expect(result.url).toBe('https://api.github.com/repos/owner/repo/issues');
    expect(result.method).toBe('POST');
    expect(result.headers['Accept']).toBe('application/vnd.github+json');
    expect(result.headers['Authorization']).toBe('Bearer ghp_token');
    expect(result.body).toContain('Bug report');
  });
});
