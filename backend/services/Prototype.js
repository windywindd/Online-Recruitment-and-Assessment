// services/jobPrototype.js
function cloneJob(job) {
  return { ...job.toObject(), _id: undefined };
}
module.exports = cloneJob;
