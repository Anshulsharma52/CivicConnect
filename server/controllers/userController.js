const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }

    const users = await User.find(query)
      .populate('department', 'name')
      .select('-password')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get staff members (Admin & Dispatchers)
// @route   GET /api/users/staff
// @access  Private
const getStaffMembers = async (req, res, next) => {
  try {
    const { departmentId } = req.query;
    const query = { role: 'staff' };

    if (departmentId) {
      query.department = departmentId;
    }

    const staff = await User.find(query)
      .populate('department', 'name categories')
      .select('-password')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new staff member (Admin only)
// @route   POST /api/users/staff
// @access  Private (Admin)
const createStaff = async (req, res, next) => {
  try {
    const { name, email, password, phone, departmentId } = req.body;

    if (!name || !email || !password || !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and assigned department are required for staff accounts.',
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Specified department does not exist.',
      });
    }

    let cleanPhone = '';
    if (phone) {
      cleanPhone = String(phone).replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must have exactly 10 digits.',
        });
      }
    }

    const staffUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: cleanPhone,
      role: 'staff',
      department: departmentId,
    });

    return res.status(201).json({
      success: true,
      message: `Staff member ${staffUser.name} created successfully.`,
      staff: {
        id: staffUser._id,
        name: staffUser.name,
        email: staffUser.email,
        role: staffUser.role,
        department: department.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'User removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getStaffMembers,
  createStaff,
  deleteUser,
};
