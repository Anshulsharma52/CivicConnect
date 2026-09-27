const Department = require('../models/Department');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get all departments with staff & complaint statistics
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });

    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const staffCount = await User.countDocuments({
          role: 'staff',
          department: dept._id,
        });

        const activeComplaintsCount = await Complaint.countDocuments({
          departmentId: dept._id,
          status: { $in: ['ASSIGNED', 'IN_PROGRESS'] },
        });

        const resolvedComplaintsCount = await Complaint.countDocuments({
          departmentId: dept._id,
          status: { $in: ['RESOLVED', 'CLOSED'] },
        });

        return {
          ...dept.toObject(),
          staffCount,
          activeComplaintsCount,
          resolvedComplaintsCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      departments: departmentsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department (Admin only)
// @route   POST /api/departments
// @access  Private (Admin)
const createDepartment = async (req, res, next) => {
  try {
    const { name, description, categories, contactEmail, contactPhone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required.',
      });
    }

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name already exists.',
      });
    }

    const department = await Department.create({
      name: name.trim(),
      description: description || '',
      categories: categories || [],
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
    });

    return res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department (Admin only)
// @route   PUT /api/departments/:id
// @access  Private (Admin)
const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, categories, contactEmail, contactPhone } = req.body;
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    if (name) department.name = name.trim();
    if (description !== undefined) department.description = description;
    if (categories !== undefined) department.categories = categories;
    if (contactEmail !== undefined) department.contactEmail = contactEmail;
    if (contactPhone !== undefined) department.contactPhone = contactPhone;

    await department.save();

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department (Admin only)
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // Reassign staff in this department to null
    await User.updateMany({ department: department._id }, { department: null });

    await department.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff belonging to a department
// @route   GET /api/departments/:id/staff
// @access  Private
const getDepartmentStaff = async (req, res, next) => {
  try {
    const staff = await User.find({
      role: 'staff',
      department: req.params.id,
    }).select('-password');

    return res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStaff,
};
