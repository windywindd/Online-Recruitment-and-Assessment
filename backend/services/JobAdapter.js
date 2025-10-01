class JobAdapter {
  constructor(jobData) {
    this.jobData = jobData;
  }

  toJobModel() {
    // Make sure to return the fields Mongoose expects
    return {
      title: this.jobData.title,
      description: this.jobData.description,
      employer: this.jobData.employer,
      type: this.jobData.type || 'full-time',
      applications: [],
      createdAt: new Date(),
    };
  }
}

module.exports = JobAdapter;
