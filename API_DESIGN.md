# CurlHelper API Design

## Core Philosophy
Make HTTP requests as intuitive as curl, but with JavaScript-native syntax and TypeScript safety.

## Key Features

### 1. Fluent Chainable API
```typescript
import curl from 'curlhelper';

// Simple GET
const data = await curl('https://api.example.com/users').get();

// POST with JSON
const result = await curl('https://api.example.com/users')
  .header('Authorization', 'Bearer token')
  .json({ name: 'John' })
  .post();

// Advanced usage
const response = await curl('https://api.example.com/data')
  .header('X-API-Key', 'secret')
  .query({ page: 1, limit: 10 })
  .timeout(5000)
  .retry(3)
  .get();
```

### 2. Curl Command Parser (Ingenious Feature!)
```typescript
import { fromCurl } from 'curlhelper';

// Parse and execute curl commands directly
const data = await fromCurl(`
  curl -X POST https://api.example.com/users \
    -H "Content-Type: application/json" \
    -d '{"name":"John"}'
`);

// Or get the request config
const config = fromCurl.parse(`curl -X GET https://api.example.com/users`);
```

### 3. Method-Specific Helpers
```typescript
// HTTP methods as functions
await curl.get('https://api.example.com/users');
await curl.post('https://api.example.com/users', { name: 'John' });
await curl.put('https://api.example.com/users/1', { name: 'Jane' });
await curl.patch('https://api.example.com/users/1', { age: 30 });
await curl.delete('https://api.example.com/users/1');
```

### 4. Advanced Features
```typescript
// File uploads
await curl('https://api.example.com/upload')
  .file('avatar', './photo.jpg')
  .post();

// Streaming responses
const stream = await curl('https://api.example.com/large-file')
  .stream()
  .get();

// Request/Response interceptors
curl.interceptors.request.use((config) => {
  config.headers.set('X-Request-ID', uuid());
  return config;
});

curl.interceptors.response.use((response) => {
  console.log('Response time:', response.timing);
  return response;
});

// Automatic retries with backoff
await curl('https://api.example.com/unreliable')
  .retry(3, { backoff: 'exponential' })
  .get();
```

### 5. TypeScript Support
```typescript
interface User {
  id: number;
  name: string;
}

const user = await curl<User>('https://api.example.com/users/1').get();
// user is typed as User

const users = await curl<User[]>('https://api.example.com/users').get();
// users is typed as User[]
```

## Performance Optimizations

1. **Connection pooling** - Reuse TCP connections
2. **Automatic compression** - Accept-Encoding: gzip, deflate, br
3. **Smart caching** - Optional built-in cache layer
4. **Minimal dependencies** - Built on native fetch/http
5. **Tree-shakeable** - Only import what you use

## API Surface

### Main API
- `curl(url: string)` - Create a request builder
- `curl.get/post/put/patch/delete()` - Direct method calls
- `fromCurl(command: string)` - Parse and execute curl commands
- `fromCurl.parse(command: string)` - Parse curl to config

### Builder Methods
- `.header(key, value)` / `.headers(object)` - Set headers
- `.query(params)` - Add query parameters
- `.json(data)` - Set JSON body
- `.form(data)` - Set form data
- `.file(name, path)` - Add file upload
- `.timeout(ms)` - Set timeout
- `.retry(count, options)` - Configure retries
- `.auth(username, password)` - Basic auth
- `.bearer(token)` - Bearer token auth
- `.proxy(url)` - Set proxy
- `.follow(max)` - Follow redirects
- `.stream()` - Stream response
- `.get/post/put/patch/delete()` - Execute request

### Response Object
```typescript
interface CurlResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
  timing: {
    total: number;
    dns: number;
    tcp: number;
    tls: number;
    request: number;
    response: number;
  };
}
```

## Package Structure
```
curlhelper/
├── src/
│   ├── index.ts           # Main exports
│   ├── builder.ts         # Fluent API builder
│   ├── executor.ts        # Request execution
│   ├── parser.ts          # Curl command parser
│   ├── interceptors.ts    # Interceptor system
│   ├── retry.ts           # Retry logic
│   ├── types.ts           # TypeScript definitions
│   └── utils.ts           # Utilities
├── tests/
├── dist/                  # Build output
└── package.json
```
