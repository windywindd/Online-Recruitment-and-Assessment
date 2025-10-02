// services/jobStrategy.js
class JobFilterByDate {
  filter(jobs) { return jobs.sort((a,b)=>a.createdAt-b.createdAt); }
}
class JobFilterByRole {
  filter(jobs) { return jobs.sort((a,b)=>a.role.localeCompare(b.role)); }
}

class JobContext {
  constructor(strategy) { this.strategy = strategy; }
  setStrategy(strategy) { this.strategy = strategy; }
  execute(jobs) { return this.strategy.filter(jobs); }
}

module.exports = { JobFilterByDate, JobFilterByRole, JobContext };
