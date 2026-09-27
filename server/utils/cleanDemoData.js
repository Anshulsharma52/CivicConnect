require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Counter = require('../models/Counter');
const Notification = require('../models/Notification');

const cleanDemoData = async () => {
  try {
    console.log('[Cleaner] Connecting to database...');
    await connectDB();

    const demoEmails = ['citizen@example.com', 'rahul.citizen@example.com'];
    const demoComplaintIds = ['CC10001', 'CC10002', 'CC10003', 'CC10004', 'CC10005', 'CC10006'];

    // 1. Find demo citizen user ObjectIds
    const demoUsers = await User.find({ email: { $in: demoEmails } });
    const demoUserIds = demoUsers.map((u) => u._id);
    if (demoUsers.length > 0) {
      console.log(`[Cleaner] Found ${demoUsers.length} demo citizen accounts:`, demoEmails);
    }

    // 2. Find demo complaints ObjectIds
    const demoComplaints = await Complaint.find({ complaintId: { $in: demoComplaintIds } });
    const demoComplaintDocIds = demoComplaints.map((c) => c._id);
    if (demoComplaints.length > 0) {
      console.log(`[Cleaner] Found ${demoComplaints.length} demo complaints:`, demoComplaintIds);
    }

    // 3. Delete demo complaints
    const complaintResult = await Complaint.deleteMany({
      $or: [
        { complaintId: { $in: demoComplaintIds } },
        { citizenId: { $in: demoUserIds } },
      ],
    });
    console.log(`[Cleaner] Removed ${complaintResult.deletedCount} demo complaints.`);

    // 4. Delete demo citizen users
    const userResult = await User.deleteMany({ email: { $in: demoEmails } });
    console.log(`[Cleaner] Removed ${userResult.deletedCount} demo citizen user accounts.`);

    // 5. Delete all orphaned or demo notifications where complaint no longer exists
    const validComplaintIds = (await Complaint.find({}, '_id')).map((c) => c._id);
    const notifResult = await Notification.deleteMany({
      $or: [
        { complaintId: { $nin: validComplaintIds } },
        { complaintId: { $in: demoComplaintDocIds } },
        { customComplaintId: { $in: demoComplaintIds } },
        { userId: { $in: demoUserIds } },
      ],
    });
    console.log(`[Cleaner] Removed ${notifResult.deletedCount} demo/orphaned notifications.`);

    // 6. Reset Counter if no complaints exist
    const totalComplaints = await Complaint.countDocuments();
    if (totalComplaints === 0) {
      await Counter.findByIdAndUpdate(
        { _id: 'complaintId' },
        { sequence: 10000 },
        { upsert: true }
      );
      console.log('[Cleaner] Reset Complaint ID Counter sequence to 10000.');
    }

    // Summary of remaining data
    const remainingUsers = await User.countDocuments();
    const remainingComplaints = await Complaint.countDocuments();
    const remainingNotifications = await Notification.countDocuments();

    console.log('\n--- CLEANUP COMPLETE ---');
    console.log(`Remaining Users: ${remainingUsers}`);
    console.log(`Remaining Complaints: ${remainingComplaints}`);
    console.log(`Remaining Notifications: ${remainingNotifications}`);

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Cleaner Error]', error);
    process.exit(1);
  }
};

cleanDemoData();
