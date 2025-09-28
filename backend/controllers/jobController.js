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
      .populate('applications.applicant', 'name email'); // include applicants if needed
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

    // prevent applying to own job
    if (job.employer.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Employers cannot apply to their own job.' });
    }

    // check duplicate application
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

    // only employer who posted the job can see applicants
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view applicants' });
    }

    res.json(job.applications);
  } catch (error) {
    console.error('Get applicants error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
