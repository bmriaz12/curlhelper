/**
 * Basic usage examples for CurlHelper
 */

import curl, { fromCurl } from '../src/index';

// Simple GET request
async function simpleGet() {
  const response = await curl('https://jsonplaceholder.typicode.com/users/1').get();
  console.log('User:', response.data);
}

// POST with JSON
async function postJson() {
  const response = await curl('https://jsonplaceholder.typicode.com/posts')
    .json({
      title: 'My Post',
      body: 'This is the content',
      userId: 1
    })
    .post();
  console.log('Created post:', response.data);
}

// With headers and query parameters
async function withHeadersAndQuery() {
  const response = await curl('https://jsonplaceholder.typicode.com/posts')
    .header('X-Custom-Header', 'value')
    .query({ userId: 1 })
    .get();
  console.log('Posts:', response.data);
}

// Using shorthand methods
async function shorthandMethods() {
  const users = await curl.get('https://jsonplaceholder.typicode.com/users');
  console.log('Users:', users.data);

  const post = await curl.post('https://jsonplaceholder.typicode.com/posts', {
    title: 'New Post',
    body: 'Content',
    userId: 1
  });
  console.log('Created:', post.data);
}

// Parse curl command
async function parseCurlCommand() {
  const response = await fromCurl(`
    curl -X GET https://jsonplaceholder.typicode.com/users/1 \
      -H "Accept: application/json"
  `).get();
  console.log('User from curl:', response.data);
}

// Run examples
async function main() {
  console.log('=== Simple GET ===');
  await simpleGet();

  console.log('\n=== POST JSON ===');
  await postJson();

  console.log('\n=== Headers & Query ===');
  await withHeadersAndQuery();

  console.log('\n=== Shorthand Methods ===');
  await shorthandMethods();

  console.log('\n=== Parse Curl ===');
  await parseCurlCommand();
}

// Uncomment to run
// main().catch(console.error);
