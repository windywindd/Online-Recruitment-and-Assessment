const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["submitted", "interview", "hired", "rejected"], default: "submitted" },
  interviewDate: { type: Date },
  interviewLocation: { type: String },
  interviewDescription: { type: String },
});

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  employer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  applications: [applicationSchema],
  createdAt: { type: Date, default: Date.now },

  type:{
    type: String,
    enum: ["full-time", "part-time"],
    default: "full-time",
    required: true
  },
});

module.exports = mongoose.model("Job", jobSchema);
