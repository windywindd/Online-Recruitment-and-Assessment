// services/jobObserver.js
const EventEmitter = require('events');
class JobObserver extends EventEmitter {}
const jobObserver = new JobObserver();

jobObserver.on('jobApplied', ({ employerEmail, jobTitle }) => {
  console.log(`Notify ${employerEmail}: New applicant for ${jobTitle}`);
});

module.exports = jobObserver;
