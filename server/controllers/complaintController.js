const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');
const { generateComplaintId } = require('../utils/idGenerator');
const { processFiles } = require('../middleware/upload');
const { sendNotification, notifyAllAdmins } = require('../services/notificationService');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    let { location } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required.',
      });
    }

    // Parse location if transmitted as stringified JSON in multipart form
    if (typeof location === 'string') {
      try {
        location = JSON.parse(location);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location JSON format.',
        });
      }
    }

    if (!location || !location.address || location.latitude === undefined || location.longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Complaint location with valid address and coordinates is required.',
      });
    }

    // Process uploaded images
    const uploadedImages = await processFiles(req.files, 'civicconnect/complaints', req);

    // Generate atomic sequential human-readable complaint ID
    const complaintId = await generateComplaintId();

    const complaint = await Complaint.create({
      complaintId,
      title,
      description,
      category,
      priority: priority || 'MEDIUM',
      status: 'PENDING',
      citizenId: req.user._id,
      location: {
        address: location.address,
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
      },
      images: uploadedImages,
      statusHistory: [
        {
          status: 'PENDING',
          changedBy: req.user._id,
          note: 'Complaint submitted by citizen.',
          timestamp: new Date(),
        },
      ],
    });

    // Notify all admins in real-time and persist in DB (Event 1)
    await notifyAllAdmins({
      complaintId: complaint._id,
      customComplaintId: complaint.complaintId,
      title: 'New Complaint',
      message: `Complaint ${complaint.complaintId} has been submitted.`,
      type: 'NEW_COMPLAINT',
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints with filters, search, and pagination
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};

    // Role-based restrictions
    if (req.user.role === 'citizen') {
      query.citizenId = req.user._id;
    } else if (req.user.role === 'staff') {
      query.assignedStaffId = req.user._id;
    } else if (req.query.myComplaints === 'true') {
      query.citizenId = req.user._id;
    }

    // Filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    if (req.query.departmentId) {
      query.departmentId = req.query.departmentId;
    }
    if (req.query.assignedStaffId) {
      query.assignedStaffId = req.query.assignedStaffId;
    }

    // Search by complaintId or title
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [{ complaintId: searchRegex }, { title: searchRegex }];
    }

    const totalComplaints = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('citizenId', 'name email phone avatar')
      .populate('departmentId', 'name categories')
      .populate('assignedStaffId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalComplaints / limit) || 1;

    return res.status(200).json({
      success: true,
      complaints,
      currentPage: page,
      totalPages,
      totalComplaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint details
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check by ObjectId or by human-readable complaintId (e.g. CC10001)
    const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: id } : { complaintId: id };

    const complaint = await Complaint.findOne(filter)
      .populate('citizenId', 'name email phone avatar')
      .populate('departmentId', 'name categories contactEmail contactPhone')
      .populate('assignedStaffId', 'name email phone avatar')
      .populate('statusHistory.changedBy', 'name role email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Role-based access validation
    if (
      req.user.role === 'citizen' &&
      complaint.citizenId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this complaint.',
      });
    }

    if (
      req.user.role === 'staff' &&
      (!complaint.assignedStaffId ||
        complaint.assignedStaffId._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only view complaints assigned directly to you.',
      });
    }

    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify a complaint (Admin only)
// @route   PATCH /api/complaints/:id/verify
// @access  Private (Admin)
const verifyComplaint = async (req, res, next) => {
  try {
    const { priority } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (complaint.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Only PENDING complaints can be verified. Current status is ${complaint.status}.`,
      });
    }

    complaint.status = 'VERIFIED';
    if (priority) complaint.priority = priority;

    complaint.statusHistory.push({
      status: 'VERIFIED',
      changedBy: req.user._id,
      note: 'Complaint verified by administrator.',
      timestamp: new Date(),
    });

    await complaint.save();

    // Event 2: Citizen receives verification notification
    await sendNotification({
      userId: complaint.citizenId,
      complaintId: complaint._id,
      customComplaintId: complaint.complaintId,
      title: 'Complaint Verified',
      message: `Your complaint ${complaint.complaintId} has been verified.`,
      type: 'VERIFIED',
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint verified successfully.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a complaint (Admin only)
// @route   PATCH /api/complaints/:id/reject
// @access  Private (Admin)
const rejectComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is required.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (complaint.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Only PENDING complaints can be rejected. Current status is ${complaint.status}.`,
      });
    }

    complaint.status = 'REJECTED';
    complaint.rejectionReason = reason.trim();

    complaint.statusHistory.push({
      status: 'REJECTED',
      changedBy: req.user._id,
      note: `Rejected: ${reason.trim()}`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Notify Citizen
    await sendNotification({
      userId: complaint.citizenId,
      complaintId: complaint._id,
      customComplaintId: complaint.complaintId,
      title: 'Complaint Rejected',
      message: `Your complaint ${complaint.complaintId} was rejected: ${reason.trim()}`,
      type: 'REJECTED',
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint rejected successfully.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign complaint to department & staff (Admin only)
// @route   PATCH /api/complaints/:id/assign
// @access  Private (Admin)
const assignComplaint = async (req, res, next) => {
  try {
    const { departmentId, assignedStaffId, priority } = req.body;

    if (!departmentId || !assignedStaffId) {
      return res.status(400).json({
        success: false,
        message: 'Both department and assigned staff are required.',
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    // Only VERIFIED (or already ASSIGNED if re-assigning) complaints can be assigned
    if (complaint.status !== 'VERIFIED' && complaint.status !== 'ASSIGNED') {
      return res.status(400).json({
        success: false,
        message: `Complaint must be in VERIFIED status before assignment. Current status: ${complaint.status}.`,
      });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const staff = await User.findById(assignedStaffId);
    if (!staff || staff.role !== 'staff') {
      return res.status(400).json({ success: false, message: 'Selected staff member is invalid.' });
    }

    complaint.departmentId = departmentId;
    complaint.assignedStaffId = assignedStaffId;
    complaint.status = 'ASSIGNED';
    if (priority) complaint.priority = priority;

    complaint.statusHistory.push({
      status: 'ASSIGNED',
      changedBy: req.user._id,
      note: `Assigned to department "${department.name}" and staff member "${staff.name}".`,
      timestamp: new Date(),
    });

    await complaint.save();

    // Event 3: Staff receives assignment notification
    await sendNotification({
      userId: staff._id,
      complaintId: complaint._id,
      customComplaintId: complaint.complaintId,
      title: 'New Complaint Assigned',
      message: `Complaint ${complaint.complaintId} has been assigned to you.`,
      type: 'ASSIGNED',
    });

    // Event 3: Citizen receives assignment notification
    await sendNotification({
      userId: complaint.citizenId,
      complaintId: complaint._id,
      customComplaintId: complaint.complaintId,
      title: 'Complaint Assigned',
      message: `Your complaint ${complaint.complaintId} has been assigned to the concerned department.`,
      type: 'ASSIGNED',
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint assigned successfully.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status (IN_PROGRESS, RESOLVED, CLOSED)
// @route   PATCH /api/complaints/:id/status
// @access  Private (Staff, Admin, Citizen for closing)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note, resolutionNote } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const currentStatus = complaint.status;

    // Transition 1: ASSIGNED -> IN_PROGRESS
    if (status === 'IN_PROGRESS') {
      if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only assigned staff or administrators can mark work as started.',
        });
      }

      if (
        req.user.role === 'staff' &&
        complaint.assignedStaffId?.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only update status for complaints assigned to you.',
        });
      }

      if (currentStatus !== 'ASSIGNED') {
        return res.status(400).json({
          success: false,
          message: `Cannot start work from status '${currentStatus}'. Expected status 'ASSIGNED'.`,
        });
      }

      complaint.status = 'IN_PROGRESS';
      complaint.statusHistory.push({
        status: 'IN_PROGRESS',
        changedBy: req.user._id,
        note: note || 'Work started on complaint site.',
        timestamp: new Date(),
      });

      await complaint.save();

      // Event 4: Citizen receives work started notification
      await sendNotification({
        userId: complaint.citizenId,
        complaintId: complaint._id,
        customComplaintId: complaint.complaintId,
        title: 'Work Started',
        message: `Work has started on complaint ${complaint.complaintId}.`,
        type: 'WORK_STARTED',
      });
    }
    // Transition 2: IN_PROGRESS -> RESOLVED
    else if (status === 'RESOLVED') {
      if (req.user.role !== 'staff' && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only assigned staff or administrators can mark complaints as resolved.',
        });
      }

      if (
        req.user.role === 'staff' &&
        complaint.assignedStaffId?.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: 'You can only resolve complaints assigned to you.',
        });
      }

      if (currentStatus !== 'IN_PROGRESS') {
        return res.status(400).json({
          success: false,
          message: `Cannot resolve complaint from status '${currentStatus}'. Expected status 'IN_PROGRESS'.`,
        });
      }

      // Process uploaded resolution proof images
      const uploadedResolutionImages = await processFiles(
        req.files,
        'civicconnect/resolutions',
        req
      );

      complaint.status = 'RESOLVED';
      complaint.resolvedAt = new Date();
      if (resolutionNote) complaint.resolutionNote = resolutionNote;
      if (uploadedResolutionImages.length > 0) {
        complaint.resolutionImages = uploadedResolutionImages;
      }

      complaint.statusHistory.push({
        status: 'RESOLVED',
        changedBy: req.user._id,
        note: resolutionNote || 'Complaint work completed and marked resolved.',
        timestamp: new Date(),
      });

      await complaint.save();

      // Event 5: Citizen receives complaint resolved notification
      await sendNotification({
        userId: complaint.citizenId,
        complaintId: complaint._id,
        customComplaintId: complaint.complaintId,
        title: 'Complaint Resolved',
        message: `Your complaint ${complaint.complaintId} has been resolved.`,
        type: 'RESOLVED',
      });
    }
    // Transition 3: RESOLVED -> CLOSED
    else if (status === 'CLOSED') {
      // Allowed for Citizen owner or Admin
      const isCitizenOwner =
        req.user.role === 'citizen' &&
        complaint.citizenId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isCitizenOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Only the citizen who filed the complaint or an administrator can close it.',
        });
      }

      if (currentStatus !== 'RESOLVED') {
        return res.status(400).json({
          success: false,
          message: `Cannot close complaint from status '${currentStatus}'. Must be RESOLVED first.`,
        });
      }

      complaint.status = 'CLOSED';
      complaint.closedAt = new Date();
      complaint.statusHistory.push({
        status: 'CLOSED',
        changedBy: req.user._id,
        note: note || (isCitizenOwner ? 'Closed by citizen with satisfaction.' : 'Closed by administrator.'),
        timestamp: new Date(),
      });

      await complaint.save();

      // Notify citizen if admin closed it
      if (isAdmin) {
        await sendNotification({
          userId: complaint.citizenId,
          complaintId: complaint._id,
          customComplaintId: complaint.complaintId,
          title: 'Complaint Closed',
          message: `Your complaint ${complaint.complaintId} has been officially closed.`,
          type: 'CLOSED',
        });
      }

      // Notify staff if assigned
      if (complaint.assignedStaffId) {
        await sendNotification({
          userId: complaint.assignedStaffId,
          complaintId: complaint._id,
          customComplaintId: complaint.complaintId,
          title: 'Complaint Closed',
          message: `Complaint ${complaint.complaintId} has been closed by ${isCitizenOwner ? 'citizen' : 'admin'}.`,
          type: 'CLOSED',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: `Unsupported status transition to '${status}'.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}.`,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete complaint (Admin only)
// @route   DELETE /api/complaints/:id
// @access  Private (Admin)
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    await complaint.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Complaint deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  verifyComplaint,
  rejectComplaint,
  assignComplaint,
  updateComplaintStatus,
  deleteComplaint,
};
