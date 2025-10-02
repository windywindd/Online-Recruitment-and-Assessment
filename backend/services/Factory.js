// services/JobFactory.js
class FullTimeJob {
  constructor(data) { Object.assign(this, data); this.type = 'full-time'; }
}
class PartTimeJob {
  constructor(data) { Object.assign(this, data); this.type = 'part-time'; }
}

class JobFactory {
  static createJob(type, data) {
    if (type === 'full-time') return new FullTimeJob(data);
    if (type === 'part-time') return new PartTimeJob(data);
    throw new Error('Invalid job type');
  }
}

module.exports = JobFactory;
