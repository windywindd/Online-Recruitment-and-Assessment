// services/JobDecorator.js
function withLogging(fn) {
  return async function(...args) {
    console.log('Executing job function...');
    const result = await fn(...args);
    console.log('Job function completed');
    return result;
  };
}

module.exports = { withLogging };
