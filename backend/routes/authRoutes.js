const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getProfile,
  updateUserProfile,
  getAllUsers,
  deleteUser
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateUserProfile);

// Admin-only routes
router.get('/users', protect, adminMiddleware, getAllUsers);
router.delete('/:id', protect, adminMiddleware, deleteUser);

module.exports = router;
