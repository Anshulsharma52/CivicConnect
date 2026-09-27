const Counter = require('../models/Counter');

/**
 * Generate sequential human-readable complaint ID (e.g. CC10001, CC10002)
 */
const generateComplaintId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    { _id: 'complaintId' },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true }
  );

  return `CC${counter.sequence}`;
};

module.exports = { generateComplaintId };
