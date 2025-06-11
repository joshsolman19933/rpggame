// Simple TypeScript test script
console.log('TypeScript test script started');

// Test TypeScript features
const testArray = [1, 2, 3, 4, 5];
const sum = testArray.reduce((a, b) => a + b, 0);
console.log(`Sum of ${testArray} is ${sum}`);

// Test async/await
async function testAsync() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return 'Async test completed';
}

testAsync()
  .then(result => console.log(result))
  .catch(err => console.error('Error:', err));

// Test ES6+ features
const obj = { a: 1, b: 2, c: 3 };
const { a, ...rest } = obj;
console.log(`Destructured: a=${a}, rest=${JSON.stringify(rest)}`);

console.log('TypeScript test script finished');
