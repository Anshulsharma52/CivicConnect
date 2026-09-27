const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../sockets/socketHandler');

/**
 * Send a notification to a specific user (saves to DB and emits over Socket.IO to private room)
 */
const sendNotification = async ({
  userId,
  complaintId,
  customComplaintId,
  title,
  message,
  type,
}) => {
  try {
    // 1. Persist notification in MongoDB
    const notification = await Notification.create({
      userId,
      complaintId,
      customComplaintId: customComplaintId || '',
      title,
      message,
      type,
      isRead: false,
    });

    // 2. Real-time emit to the user's private Socket.IO room: user_<userId>
    try {
      const io = getIO();
      const room = `user_${userId.toString()}`;
      io.to(room).emit('new_notification', notification);
      console.log(`[Notification Service] Dispatched "${type}" to room: ${room}`);
    } catch (socketErr) {
      console.warn(`[Notification Service] Socket emit skipped: ${socketErr.message}`);
    }

    return notification;
  } catch (error) {
    console.error(`[Notification Service Error]`, error);
  }
};

/**
 * Notify all system administrators (e.g. on new complaint submission)
 */
const notifyAllAdmins = async ({
  complaintId,
  customComplaintId,
  title,
  message,
  type = 'NEW_COMPLAINT',
}) => {
  try {
    const admins = await User.find({ role: 'admin' });

    for (const admin of admins) {
      await sendNotification({
        userId: admin._id,
        complaintId,
        customComplaintId,
        title,
        message,
        type,
      });
    }

    // Also emit to admin_room
    try {
      const io = getIO();
      io.to('admin_room').emit('admin_alert', {
        complaintId,
        customComplaintId,
        title,
        message,
        type,
        createdAt: new Date(),
      });
    } catch (socketErr) {
      // ignore
    }
  } catch (error) {
    console.error(`[Notification Service Error - Admins]`, error);
  }
};

module.exports = {
  sendNotification,
  notifyAllAdmins,
};
