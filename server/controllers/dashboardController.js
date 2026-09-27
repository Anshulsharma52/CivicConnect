const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Get role-aware dashboard statistics and metrics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const { role, _id: userId } = req.user;

    // 1. Citizen Dashboard Metrics
    if (role === 'citizen') {
      const totalComplaints = await Complaint.countDocuments({ citizenId: userId });
      const pending = await Complaint.countDocuments({ citizenId: userId, status: 'PENDING' });
      const verified = await Complaint.countDocuments({ citizenId: userId, status: 'VERIFIED' });
      const assigned = await Complaint.countDocuments({ citizenId: userId, status: 'ASSIGNED' });
      const inProgress = await Complaint.countDocuments({ citizenId: userId, status: 'IN_PROGRESS' });
      const resolved = await Complaint.countDocuments({ citizenId: userId, status: 'RESOLVED' });
      const closed = await Complaint.countDocuments({ citizenId: userId, status: 'CLOSED' });
      const rejected = await Complaint.countDocuments({ citizenId: userId, status: 'REJECTED' });

      const recentComplaints = await Complaint.find({ citizenId: userId })
        .populate('departmentId', 'name')
        .populate('assignedStaffId', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.status(200).json({
        success: true,
        stats: {
          totalComplaints,
          pending,
          verified,
          assigned,
          inProgress,
          resolved,
          closed,
          rejected,
        },
        recentComplaints,
      });
    }

    // 2. Staff Dashboard Metrics
    if (role === 'staff') {
      const totalAssigned = await Complaint.countDocuments({ assignedStaffId: userId });
      const pendingAction = await Complaint.countDocuments({
        assignedStaffId: userId,
        status: 'ASSIGNED',
      });
      const inProgress = await Complaint.countDocuments({
        assignedStaffId: userId,
        status: 'IN_PROGRESS',
      });
      const resolved = await Complaint.countDocuments({
        assignedStaffId: userId,
        status: { $in: ['RESOLVED', 'CLOSED'] },
      });

      const recentAssigned = await Complaint.find({ assignedStaffId: userId })
        .populate('citizenId', 'name phone')
        .populate('departmentId', 'name')
        .sort({ updatedAt: -1 })
        .limit(6);

      return res.status(200).json({
        success: true,
        stats: {
          totalAssigned,
          pendingAction,
          inProgress,
          resolved,
        },
        recentComplaints: recentAssigned,
      });
    }

    // 3. Admin Dashboard Metrics (Comprehensive system-wide analytics)
    const [
      totalComplaints,
      pending,
      verified,
      assigned,
      inProgress,
      resolved,
      closed,
      rejected,
      totalCitizens,
      totalStaff,
      totalDepartments,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'PENDING' }),
      Complaint.countDocuments({ status: 'VERIFIED' }),
      Complaint.countDocuments({ status: 'ASSIGNED' }),
      Complaint.countDocuments({ status: 'IN_PROGRESS' }),
      Complaint.countDocuments({ status: 'RESOLVED' }),
      Complaint.countDocuments({ status: 'CLOSED' }),
      Complaint.countDocuments({ status: 'REJECTED' }),
      User.countDocuments({ role: 'citizen' }),
      User.countDocuments({ role: 'staff' }),
      Department.countDocuments(),
    ]);

    // Breakdown by Category
    const categoryStats = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Breakdown by Priority
    const priorityStats = await Complaint.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    // Department-wise complaint statistics
    const departments = await Department.find();
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const count = await Complaint.countDocuments({ departmentId: dept._id });
        const resolvedCount = await Complaint.countDocuments({
          departmentId: dept._id,
          status: { $in: ['RESOLVED', 'CLOSED'] },
        });
        return {
          id: dept._id,
          name: dept.name,
          total: count,
          resolved: resolvedCount,
        };
      })
    );

    // Recent Complaints
    const recentComplaints = await Complaint.find()
      .populate('citizenId', 'name email')
      .populate('departmentId', 'name')
      .populate('assignedStaffId', 'name')
      .sort({ createdAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      stats: {
        totalComplaints,
        pending,
        verified,
        assigned,
        inProgress,
        resolved,
        closed,
        rejected,
        totalCitizens,
        totalStaff,
        totalDepartments,
      },
      categoryStats,
      priorityStats,
      departmentStats,
      recentComplaints,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
