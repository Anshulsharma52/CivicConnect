const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getStaffMembers,
  createStaff,
  deleteUser,
} = require('../controllers/userController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/', authorizeRoles('admin'), getAllUsers);
router.get('/staff', authorizeRoles('admin', 'staff'), getStaffMembers);
router.post('/staff', authorizeRoles('admin'), createStaff);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

module.exports = router;
