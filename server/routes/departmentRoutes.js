const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStaff,
} = require('../controllers/departmentController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

router.use(authenticateUser);

router
  .route('/')
  .get(getDepartments)
  .post(authorizeRoles('admin'), createDepartment);

router
  .route('/:id')
  .put(authorizeRoles('admin'), updateDepartment)
  .delete(authorizeRoles('admin'), deleteDepartment);

router.get('/:id/staff', getDepartmentStaff);

module.exports = router;
