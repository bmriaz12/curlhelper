/**
 * Advanced usage examples for CurlHelper
 */

import curl from '../src/index';

// Retry with exponential backoff
async function withRetry() {
  try {
    const response = await curl('https://jsonplaceholder.typicode.com/users')
      .retry(3, {
        backoff: 'exponential',
        delay: 1000,
        onRetry: (attempt, error) => {
          console.log(`Retry attempt ${attempt}:`, error.message);
        }
      })
      .get();
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Failed after retries:', error);
  }
}

// Request and response interceptors
function setupInterceptors() {
  // Add timestamp to all requests
  curl.interceptors.request.use((config) => {
    console.log(`Making request to ${config.url}`);
    config.headers.set('X-Request-Time', Date.now().toString());
    return config;
  });

  // Log response timing
  curl.interceptors.response.use((response) => {
    console.log(`Response received in ${response.timing.total}ms`);
    return response;
  });
}

// Parallel requests
async function parallelRequests() {
  const [users, posts, comments] = await Promise.all([
    curl('https://jsonplaceholder.typicode.com/users').get(),
    curl('https://jsonplaceholder.typicode.com/posts').get(),
    curl('https://jsonplaceholder.typicode.com/comments').get(),
  ]);

  console.log(`Fetched ${users.data.length} users, ${posts.data.length} posts, ${comments.data.length} comments`);
}

// Timeout handling
async function withTimeout() {
  try {
    const response = await curl('https://jsonplaceholder.typicode.com/users')
      .timeout(5000)
      .get();
    console.log('Response received within timeout');
  } catch (error) {
    console.error('Request timed out');
  }
}

// Abort controller
async function withAbort() {
  const controller = new AbortController();

  // Cancel after 1 second
  setTimeout(() => {
    console.log('Aborting request...');
    controller.abort();
  }, 1000);

  try {
    await curl('https://jsonplaceholder.typicode.com/users')
      .abort(controller.signal)
      .get();
  } catch (error) {
    console.log('Request was aborted');
  }
}

// TypeScript generics
interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

async function typedRequest() {
  const response = await curl<User>('https://jsonplaceholder.typicode.com/users/1').get();

  // TypeScript knows response.data is User
  console.log(`User ${response.data.name} (${response.data.email})`);
}

// Run examples
async function main() {
  console.log('=== Setup Interceptors ===');
  setupInterceptors();

  console.log('\n=== With Retry ===');
  await withRetry();

  console.log('\n=== Parallel Requests ===');
  await parallelRequests();

  console.log('\n=== With Timeout ===');
  await withTimeout();

  console.log('\n=== Typed Request ===');
  await typedRequest();

  console.log('\n=== With Abort ===');
  await withAbort();
}

// Uncomment to run
// main().catch(console.error);
