const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  verifyComplaint,
  rejectComplaint,
  assignComplaint,
  updateComplaintStatus,
  deleteComplaint,
} = require('../controllers/complaintController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(authenticateUser);

router
  .route('/')
  .post(upload.array('images', 5), createComplaint)
  .get(getComplaints);

router.get('/:id', getComplaintById);

// Admin-only management endpoints
router.patch('/:id/verify', authorizeRoles('admin'), verifyComplaint);
router.patch('/:id/reject', authorizeRoles('admin'), rejectComplaint);
router.patch('/:id/assign', authorizeRoles('admin'), assignComplaint);
router.delete('/:id', authorizeRoles('admin'), deleteComplaint);

// Lifecycle status progression (Staff / Admin / Citizen close)
router.patch(
  '/:id/status',
  upload.array('resolutionImages', 5),
  updateComplaintStatus
);

module.exports = router;
