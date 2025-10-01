// services/JobFacade.js
const Job = require('../models/jobModel');

class JobFacade {
  static async create(data) {
    const job = new Job(data);
    return job.save();
  }

  static async getAll() {
    return Job.find().populate('employer', 'name email');
  }

  static async deleteById(id) {
    const job = await Job.findById(id);
    if (!job) throw new Error('Job not found');
    return job.deleteOne();
  }
}

module.exports = JobFacade;
