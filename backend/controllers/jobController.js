const Job = require('../models/jobModel');

// CREATE JOB (Employers only)
exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can post jobs.' });
    }

    const { title, description } = req.body;
    const employer = req.user._id;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide title and description' });
    }

    const newJob = new Job({ title, description, employer });
    await newJob.save();

    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL JOBS (Everyone can view)
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('employer', 'name email role')
      .populate('applications.applicant', 'name email'); 
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE JOB (Employer only, their own jobs)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name role');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (!job.employer) {
      return res.status(400).json({ message: 'Job has no employer assigned' });
    }

    if (req.user.role !== 'employer' || job.employer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You cannot delete this job.' });
    }

    await job.deleteOne();
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE JOB (Employer only, their own jobs)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (req.user.role !== 'employer' || job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You cannot edit this job.' });
    }

    const { title, description } = req.body;
    job.title = title || job.title;
    job.description = description || job.description;

    await job.save();
    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// APPLY TO A JOB (Employees only)
exports.applyJob = async (req, res) => {
  try {
    if (req.user.role !== 'employee') {
      return res.status(403).json({ message: 'Only employees can apply for jobs.' });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Employers cannot apply to their own job.' });
    }

    const alreadyApplied = job.applications.some(
      (app) => app.applicant.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You already applied for this job.' });
    }

    job.applications.push({ applicant: req.user._id });
    await job.save();

    res.json({ message: 'Applied successfully!' });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET APPLICANTS FOR A JOB (Employer only)
exports.getApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('applications.applicant', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applicants' });
    }

    res.json(job.applications);
  } catch (error) {
    console.error('Get applicants error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// SCHEDULE INTERVIEW (Employer schedules applicant interview)
exports.scheduleInterview = async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;
    const { interviewDate, interviewLocation, interviewDescription } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const application = job.applications.find(
      (app) => app.applicant.toString() === applicantId
    );
    if (!application) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    application.status = "interview";
    application.interviewDate = interviewDate;
    application.interviewLocation = interviewLocation;
    application.interviewDescription = interviewDescription;

    await job.save();

    res.json({ message: "Interview scheduled", application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to schedule interview" });
  }
};

exports.getMyInterviews = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ message: "Only employees can view their interviews" });
    }

    const jobs = await Job.find({ "applications.applicant": req.user.id })
      .populate("employer", "name email");

    const interviews = jobs.flatMap(job =>
      job.applications
        .filter(app => String(app.applicant) === String(req.user.id) && app.interviewDate)
        .map(app => ({
          jobTitle: job.title,
          employer: job.employer?.name,
          employerEmail: job.employer?.email,
          interviewDate: app.interviewDate,
          interviewLocation: app.interviewLocation,
          interviewDescription: app.interviewDescription,
        }))
    );

    res.json(interviews);
  } catch (error) {
    console.error("Get interviews error:", error);
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
};
