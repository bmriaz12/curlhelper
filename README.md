# CurlHelper

> A powerful, curl-like HTTP client for JavaScript and TypeScript

[![npm version](https://img.shields.io/npm/v/curlhelper.svg)](https://www.npmjs.com/package/curlhelper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CurlHelper** is an intuitive HTTP client that brings the simplicity of curl to JavaScript/TypeScript with a modern, chainable API. Whether you're making simple GET requests or handling complex workflows, CurlHelper makes it effortless.

## ✨ Key Features

- 🔗 **Fluent Chainable API** - Natural, readable syntax for building requests
- 🎯 **Curl Command Parser** - Paste curl commands directly and execute them
- 📘 **Full TypeScript Support** - Complete type safety with generics
- ⚡ **Built on Native Fetch** - Modern, performant, zero dependencies
- 🔄 **Automatic Retries** - Smart retry logic with exponential backoff
- 🎭 **Request/Response Interceptors** - Middleware-like functionality
- 📊 **Request Timing** - Built-in performance metrics
- 🎨 **Intuitive API** - Designed to feel like curl but JavaScript-native

## 📦 Installation

```bash
npm install curlhelper
```

```bash
yarn add curlhelper
```

```bash
pnpm add curlhelper
```

## 🚀 Quick Start

### Simple GET Request

```typescript
import curl from 'curlhelper';

const response = await curl('https://api.github.com/users/octocat').get();
console.log(response.data);
```

### POST with JSON

```typescript
const user = await curl('https://api.example.com/users')
  .json({ name: 'John Doe', email: 'john@example.com' })
  .post();
```

### Chainable API

```typescript
const response = await curl('https://api.example.com/data')
  .header('Authorization', 'Bearer token')
  .query({ page: 1, limit: 10 })
  .timeout(5000)
  .retry(3)
  .get();
```

## 🎯 Parse Curl Commands (Ingenious Feature!)

Convert curl commands directly to JavaScript:

```typescript
import { fromCurl } from 'curlhelper';

const response = await fromCurl(`
  curl -X POST https://api.github.com/repos/owner/repo/issues \
    -H "Accept: application/vnd.github+json" \
    -H "Authorization: Bearer ghp_token" \
    -d '{"title":"Bug report","body":"Found a bug"}'
`).post();
```

Or parse without executing:

```typescript
const config = fromCurl.parse('curl -X GET https://api.example.com/users');
console.log(config); // { url: '...', method: 'GET', headers: {...} }
```

## 📖 API Documentation

### Creating Requests

```typescript
// Builder pattern
const builder = curl('https://api.example.com/endpoint');

// Shorthand methods
await curl.get('https://api.example.com/users');
await curl.post('https://api.example.com/users', { name: 'John' });
await curl.put('https://api.example.com/users/1', { name: 'Jane' });
await curl.patch('https://api.example.com/users/1', { age: 30 });
await curl.delete('https://api.example.com/users/1');
```

### Builder Methods

#### Headers

```typescript
// Single header
curl('https://api.example.com')
  .header('X-API-Key', 'secret')
  .get();

// Multiple headers
curl('https://api.example.com')
  .headers({
    'X-API-Key': 'secret',
    'X-Custom': 'value'
  })
  .get();
```

#### Authentication

```typescript
// Basic Auth
curl('https://api.example.com')
  .auth('username', 'password')
  .get();

// Bearer Token
curl('https://api.example.com')
  .bearer('your-token-here')
  .get();
```

#### Query Parameters

```typescript
curl('https://api.example.com/search')
  .query({ q: 'javascript', page: 1, limit: 20 })
  .get();
// → https://api.example.com/search?q=javascript&page=1&limit=20
```

#### Request Body

```typescript
// JSON (automatic Content-Type)
curl('https://api.example.com/users')
  .json({ name: 'John', age: 30 })
  .post();

// Form Data
curl('https://api.example.com/login')
  .form({ username: 'john', password: 'secret' })
  .post();
```

#### File Uploads

```typescript
// Upload files
curl('https://api.example.com/upload')
  .file('avatar', './photo.jpg')
  .file('document', fileBuffer, 'doc.pdf')
  .post();

// With additional fields
curl('https://api.example.com/upload')
  .json({ userId: 123 })
  .file('avatar', './photo.jpg')
  .post();
```

#### Timeout & Retries

```typescript
// Set timeout
curl('https://api.example.com')
  .timeout(5000) // 5 seconds
  .get();

// Automatic retries with exponential backoff
curl('https://api.example.com')
  .retry(3, {
    backoff: 'exponential',
    delay: 1000,
    maxDelay: 30000,
    onRetry: (attempt, error) => {
      console.log(`Retry attempt ${attempt}:`, error.message);
    }
  })
  .get();
```

### TypeScript Support

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Response is typed as User
const response = await curl<User>('https://api.example.com/users/1').get();
console.log(response.data.name); // TypeScript knows this is a string

// Array of Users
const users = await curl<User[]>('https://api.example.com/users').get();
```

### Response Object

```typescript
const response = await curl('https://api.example.com').get();

// Response properties
response.data       // Parsed response body
response.status     // HTTP status code (200, 404, etc.)
response.statusText // HTTP status text ('OK', 'Not Found', etc.)
response.headers    // Response headers (Headers object)
response.ok         // true if status is 200-299
response.timing     // Performance metrics
response.raw        // Original fetch Response object
```

### Interceptors

Add global middleware for all requests and responses:

```typescript
// Request interceptor
curl.interceptors.request.use((config) => {
  // Add timestamp to all requests
  config.headers.set('X-Request-Time', Date.now().toString());
  return config;
});

// Response interceptor
curl.interceptors.response.use((response) => {
  // Log all responses
  console.log(`${response.status} - ${response.timing.total}ms`);
  return response;
});

// Remove interceptor
const id = curl.interceptors.request.use(myInterceptor);
curl.interceptors.request.eject(id);
```

## 🎨 Advanced Examples

### Parallel Requests

```typescript
const [users, posts, comments] = await Promise.all([
  curl('https://api.example.com/users').get(),
  curl('https://api.example.com/posts').get(),
  curl('https://api.example.com/comments').get(),
]);
```

### Conditional Requests

```typescript
const response = await curl('https://api.example.com/data')
  .header('If-None-Match', etag)
  .get();

if (response.status === 304) {
  console.log('Data not modified, use cache');
}
```

### Streaming Responses

```typescript
const response = await curl('https://api.example.com/large-file')
  .stream()
  .get();

// response.data is the raw Response object with body stream
const reader = response.data.body.getReader();
```

### Abort Requests

```typescript
const controller = new AbortController();

// Abort after 3 seconds
setTimeout(() => controller.abort(), 3000);

try {
  await curl('https://api.example.com/slow')
    .abort(controller.signal)
    .get();
} catch (error) {
  console.log('Request aborted');
}
```

### Error Handling

```typescript
try {
  const response = await curl('https://api.example.com/users').get();

  if (!response.ok) {
    console.error(`HTTP Error: ${response.status}`);
  }
} catch (error) {
  console.error('Request failed:', error);
}
```

## 🔄 Comparison with Other Libraries

### vs. Fetch

```typescript
// Native Fetch
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  body: JSON.stringify({ name: 'John' })
});
const data = await response.json();

// CurlHelper
const { data } = await curl('https://api.example.com/users')
  .bearer('token')
  .json({ name: 'John' })
  .post();
```

### vs. Axios

```typescript
// Axios
const response = await axios.post('https://api.example.com/users',
  { name: 'John' },
  { headers: { 'Authorization': 'Bearer token' } }
);

// CurlHelper
const response = await curl('https://api.example.com/users')
  .bearer('token')
  .json({ name: 'John' })
  .post();
```

## 🏗️ Architecture

CurlHelper is built with:

- **Zero runtime dependencies** - Only uses native Web APIs
- **TypeScript first** - Fully typed from the ground up
- **Tree-shakeable** - Import only what you need
- **Modern bundling** - ESM and CJS support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © Steven Rugg | stevenrugg.dev

## 🙏 Acknowledgments

Inspired by the simplicity of curl and the elegance of modern JavaScript.

---

Made with ❤️ for developers who love clean APIs
