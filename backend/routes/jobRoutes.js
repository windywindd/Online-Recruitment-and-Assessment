const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');


// Create a new job (employer only)
router.post('/', protect, jobController.createJob);

// Get all jobs (everyone)
router.get('/', jobController.getJobs);

// Update a job (employer only, own jobs)
router.put('/:id', protect, jobController.updateJob);

// Delete a job (employer only, own jobs)
router.delete('/:id', protect, jobController.deleteJob);

// Apply to a job (employee only)
router.post('/:id/apply', protect, jobController.applyJob);
// Get applicants for a job (employer only)
router.get('/:id/applicants', protect, jobController.getApplicants);

router.put(
  '/:jobId/applicants/:applicantId/interview',
  protect,
  jobController.scheduleInterview
);

// routes/jobRoutes.js
router.get('/my-interviews', protect, jobController.getMyInterviews);

module.exports = router;
