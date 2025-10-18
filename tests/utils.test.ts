/**
 * Tests for utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  buildUrl,
  encodeBasicAuth,
  calculateBackoff,
  isRetryableStatus,
  shouldParseJson,
} from '../src/utils';

describe('Utils', () => {
  describe('buildUrl', () => {
    it('should return URL unchanged without query params', () => {
      const url = buildUrl('https://api.example.com/users');
      expect(url).toBe('https://api.example.com/users');
    });

    it('should append query parameters', () => {
      const url = buildUrl('https://api.example.com/users', { page: 1, limit: 10 });
      expect(url).toBe('https://api.example.com/users?page=1&limit=10');
    });

    it('should handle boolean query params', () => {
      const url = buildUrl('https://api.example.com/users', { active: true });
      expect(url).toBe('https://api.example.com/users?active=true');
    });

    it('should preserve existing query params', () => {
      const url = buildUrl('https://api.example.com/users?sort=name', { page: 1 });
      expect(url).toBe('https://api.example.com/users?sort=name&page=1');
    });
  });

  describe('encodeBasicAuth', () => {
    it('should encode credentials correctly', () => {
      const encoded = encodeBasicAuth('username', 'password');
      expect(encoded).toBe('Basic dXNlcm5hbWU6cGFzc3dvcmQ=');
    });
  });

  describe('calculateBackoff', () => {
    it('should calculate linear backoff', () => {
      expect(calculateBackoff(1, 'linear', 1000)).toBeCloseTo(1000, -2);
      expect(calculateBackoff(2, 'linear', 1000)).toBeCloseTo(2000, -2);
      expect(calculateBackoff(3, 'linear', 1000)).toBeCloseTo(3000, -2);
    });

    it('should calculate exponential backoff', () => {
      const delay1 = calculateBackoff(1, 'exponential', 1000);
      const delay2 = calculateBackoff(2, 'exponential', 1000);
      const delay3 = calculateBackoff(3, 'exponential', 1000);

      expect(delay1).toBeGreaterThanOrEqual(750);
      expect(delay1).toBeLessThanOrEqual(1250);
      expect(delay2).toBeGreaterThanOrEqual(1500);
      expect(delay2).toBeLessThanOrEqual(2500);
      expect(delay3).toBeGreaterThanOrEqual(3000);
      expect(delay3).toBeLessThanOrEqual(5000);
    });

    it('should respect max delay', () => {
      const delay = calculateBackoff(10, 'exponential', 1000, 5000);
      expect(delay).toBeLessThanOrEqual(5000);
    });
  });

  describe('isRetryableStatus', () => {
    it('should identify retryable status codes', () => {
      expect(isRetryableStatus(408)).toBe(true);
      expect(isRetryableStatus(429)).toBe(true);
      expect(isRetryableStatus(500)).toBe(true);
      expect(isRetryableStatus(502)).toBe(true);
      expect(isRetryableStatus(503)).toBe(true);
      expect(isRetryableStatus(504)).toBe(true);
    });

    it('should identify non-retryable status codes', () => {
      expect(isRetryableStatus(200)).toBe(false);
      expect(isRetryableStatus(400)).toBe(false);
      expect(isRetryableStatus(401)).toBe(false);
      expect(isRetryableStatus(404)).toBe(false);
    });
  });

  describe('shouldParseJson', () => {
    it('should detect JSON content type', () => {
      const headers = new Headers({ 'content-type': 'application/json' });
      expect(shouldParseJson(headers)).toBe(true);
    });

    it('should detect JSON with charset', () => {
      const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
      expect(shouldParseJson(headers)).toBe(true);
    });

    it('should detect JSON variants', () => {
      const headers = new Headers({ 'content-type': 'application/vnd.api+json' });
      expect(shouldParseJson(headers)).toBe(true);
    });

    it('should not detect non-JSON types', () => {
      const headers = new Headers({ 'content-type': 'text/html' });
      expect(shouldParseJson(headers)).toBe(false);
    });
  });
});
