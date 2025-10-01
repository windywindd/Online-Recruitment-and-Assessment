// services/jobProxy.js
function JobProxy(job, userRole) {
  return new Proxy(job, {
    get(target, prop) {
      if (prop === 'salary' && userRole !== 'employer') return 'Confidential';
      return target[prop];
    }
  });
}
module.exports = JobProxy;
