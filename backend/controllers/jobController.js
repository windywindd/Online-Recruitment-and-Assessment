// jobController.js
const Job = require('../models/jobModel');
const JobFacade = require('../services/Facade');
const JobFactory = require('../services/Factory');
const JobAdapter = require('../services/Adapter');
const { withLogging } = require('../services/Decorator');
const jobObserver = require('../services/Observer');
const cloneJob = require('../services/Prototype');
const JobProxy = require('../services/Proxy');
const logger = require('../services/Logger');
const { JobFilterByDate, JobFilterByRole, JobContext } = require('../services/Strategy');

// =================== CREATE JOB (Employers only) ===================
exports.createJob = withLogging(async (req, res) => {
  try {
    if (req.user.role !== 'employer') {
      return res.status(403).json({ message: 'Access denied. Only employers can post jobs.' });
    }

    const { title, description, type } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please provide title and description' });
    }

    // Make sure employer exists
    if (!req.user._id) {
      return res.status(400).json({ message: 'Invalid user. Employer not found.' });
    }

    // Factory Pattern
    const jobData = JobFactory.createJob(type || 'full-time', {
      title,
      description,
      employer: req.user._id,
    });

    // Adapter Pattern
    const newJob = new Job(new JobAdapter(jobData).toJobModel());

    // Facade Pattern
    const savedJob = await JobFacade.create(newJob);

    // Observer / Singleton Logger
    jobObserver.emit('jobCreated', { employerEmail: req.user.email, jobTitle: title });
    logger.log(`Job created by ${req.user._id}`);

    res.status(201).json(savedJob);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// =================== GET ALL JOBS (Everyone) ===================
exports.getJobs = async (req, res) => {
  try {
    const sort = req.query.sort || 'date';
    const sortOption = sort === 'role' ? { title: 1 } : { createdAt: -1 };

    const jobs = await Job.find()
      .populate({
        path: 'applications',
        populate: { path: 'applicant', select: 'name email' }
      })
      .populate('employer', 'name email')
      .sort(sortOption);

    res.json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// =================== DELETE JOB (Employer only) ===================
exports.deleteJob = withLogging(async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name role');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (req.user.role !== 'employer' || job.employer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You cannot delete this job.' });
    }

    await JobFacade.deleteById(req.params.id);

    // Observer Pattern: notify subscribers if needed
    jobObserver.emit('jobDeleted', { employerEmail: job.employer.email, jobTitle: job.title });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =================== UPDATE JOB (Employer only) ===================
exports.updateJob = withLogging(async (req, res) => {
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
    logger.log(`Job updated by ${req.user._id}`);

    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// =================== APPLY TO JOB (Employees only) ===================
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
      app => app.applicant.toString() === req.user._id.toString()
    );
    if (alreadyApplied) {
      return res.status(400).json({ message: 'You already applied for this job.' });
    }

    job.applications.push({ applicant: req.user._id });
    await job.save();

    // Observer Pattern: notify employer
    jobObserver.emit('jobApplied', { employerEmail: job.employer.email, jobTitle: job.title });

    res.json({ message: 'Applied successfully!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== GET APPLICANTS ===================
exports.getApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('applications.applicant', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applicants' });
    }

    res.json(job.applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =================== SCHEDULE INTERVIEW ===================
exports.scheduleInterview = async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;
    const { interviewDate, interviewLocation, interviewDescription } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const application = job.applications.find(
      app => app.applicant.toString() === applicantId
    );
    if (!application) return res.status(404).json({ message: "Applicant not found" });

    application.status = "interview";
    application.interviewDate = interviewDate;
    application.interviewLocation = interviewLocation;
    application.interviewDescription = interviewDescription;

    await job.save();

    res.json({ message: "Interview scheduled", application });
  } catch (error) {
    res.status(500).json({ message: "Failed to schedule interview" });
  }
};

// =================== GET MY INTERVIEWS ===================
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
    res.status(500).json({ message: "Failed to fetch interviews" });
  }
};

// console.log('Job data before saving:', newJob);
