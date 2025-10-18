/**
 * Parser for curl commands
 * Converts curl command strings into RequestBuilder instances
 */

import type { CurlParseResult, HttpMethod } from './types';
import { RequestBuilder } from './builder';

/**
 * Parse curl command string into request configuration
 */
export function parseCurlCommand(command: string): CurlParseResult {
  // Normalize whitespace and line continuations
  const normalized = command
    .replace(/\\\n/g, ' ')  // Handle line continuations
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();

  // Remove 'curl' at the start if present
  const withoutCurl = normalized.replace(/^curl\s+/, '');

  const result: CurlParseResult = {
    url: '',
    method: 'GET',
    headers: {},
  };

  // Tokenize the command
  const tokens = tokenize(withoutCurl);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Skip empty tokens
    if (!token) continue;

    // Handle flags
    if (token.startsWith('-')) {
      const flag = token;
      const nextToken = tokens[i + 1];

      switch (flag) {
        case '-X':
        case '--request':
          if (nextToken) {
            result.method = nextToken.toUpperCase() as HttpMethod;
            i++;
          }
          break;

        case '-H':
        case '--header':
          if (nextToken) {
            const [key, ...valueParts] = nextToken.split(':');
            const value = valueParts.join(':').trim();
            if (key && value) {
              result.headers[key.trim()] = value;
            }
            i++;
          }
          break;

        case '-d':
        case '--data':
        case '--data-raw':
        case '--data-binary':
          if (nextToken) {
            result.body = nextToken;
            if (!result.method || result.method === 'GET') {
              result.method = 'POST';
            }
            i++;
          }
          break;

        case '-u':
        case '--user':
          if (nextToken) {
            const [username, password] = nextToken.split(':');
            if (username && password) {
              result.auth = { username, password };
            }
            i++;
          }
          break;

        case '--url':
          if (nextToken) {
            result.url = nextToken;
            i++;
          }
          break;

        case '-A':
        case '--user-agent':
          if (nextToken) {
            result.headers['User-Agent'] = nextToken;
            i++;
          }
          break;

        case '-e':
        case '--referer':
          if (nextToken) {
            result.headers['Referer'] = nextToken;
            i++;
          }
          break;

        case '-b':
        case '--cookie':
          if (nextToken) {
            result.headers['Cookie'] = nextToken;
            i++;
          }
          break;

        case '--compressed':
          result.headers['Accept-Encoding'] = 'gzip, deflate, br';
          break;

        // Flags without values
        case '-L':
        case '--location':
        case '-k':
        case '--insecure':
        case '-s':
        case '--silent':
        case '-S':
        case '--show-error':
        case '-i':
        case '--include':
        case '-v':
        case '--verbose':
          // These are handled at execution level, not config level
          break;

        default:
          // Unknown flag, might be a URL if it doesn't start with -
          if (!token.startsWith('-') && !result.url && isUrl(token)) {
            result.url = token;
          }
      }
    } else if (!result.url && isUrl(token)) {
      // First non-flag token is likely the URL
      result.url = token;
    }
  }

  return result;
}

/**
 * Tokenize curl command respecting quotes
 */
function tokenize(command: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inQuote: string | null = null;
  let escaped = false;

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      escaped = true;
      continue;
    }

    if (char === '"' || char === "'") {
      if (!inQuote) {
        inQuote = char;
      } else if (inQuote === char) {
        inQuote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === ' ' && !inQuote) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Check if string is a URL
 */
function isUrl(str: string): boolean {
  return /^https?:\/\//.test(str) || str.startsWith('www.');
}

/**
 * Convert curl command to RequestBuilder
 */
export function fromCurl(command: string): RequestBuilder {
  const parsed = parseCurlCommand(command);

  if (!parsed.url) {
    throw new Error('No URL found in curl command');
  }

  const builder = new RequestBuilder(parsed.url);

  // Set method
  if (parsed.method && parsed.method !== 'GET') {
    // Method will be set when executing (get(), post(), etc.)
  }

  // Set headers
  if (Object.keys(parsed.headers).length > 0) {
    builder.headers(parsed.headers);
  }

  // Set body
  if (parsed.body) {
    // Try to parse as JSON
    try {
      const jsonBody = JSON.parse(parsed.body);
      builder.json(jsonBody);
    } catch {
      // If not JSON, treat as form data or raw body
      if (parsed.headers['Content-Type']?.includes('application/x-www-form-urlencoded')) {
        const formData: Record<string, string> = {};
        parsed.body.split('&').forEach((pair) => {
          const [key, value] = pair.split('=');
          if (key) {
            formData[decodeURIComponent(key)] = decodeURIComponent(value || '');
          }
        });
        builder.form(formData);
      }
      // For raw body, we'd need to extend the builder API
    }
  }

  // Set auth
  if (parsed.auth) {
    builder.auth(parsed.auth.username, parsed.auth.password);
  }

  return builder;
}

/**
 * Parse curl command without executing (returns config)
 */
export const parse = parseCurlCommand;
