require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Department = require('../models/Department');
const Complaint = require('../models/Complaint');
const Counter = require('../models/Counter');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Purging existing collection records...');
    await User.deleteMany({});
    await Department.deleteMany({});
    await Complaint.deleteMany({});
    await Counter.deleteMany({});
    await Notification.deleteMany({});

    // Reset Complaint Counter starting at 10000
    await Counter.create({ _id: 'complaintId', sequence: 10006 });

    console.log('[Seeder] Creating municipal departments...');
    const departments = await Department.create([
      {
        name: 'Road & Infrastructure',
        description: 'Pothole repair, road surface reconstruction, and structural public facilities.',
        categories: ['Road Damage', 'Public Infrastructure'],
        contactEmail: 'roads@civicconnect.gov',
        contactPhone: '+91 11 2345 6701',
      },
      {
        name: 'Solid Waste Management',
        description: 'Garbage disposal, street sanitization, and recycling depot coordination.',
        categories: ['Garbage'],
        contactEmail: 'sanitation@civicconnect.gov',
        contactPhone: '+91 11 2345 6702',
      },
      {
        name: 'Water Supply & Sewerage',
        description: 'Potable municipal water pipelines, leakage rectification, and drainage management.',
        categories: ['Water', 'Drainage'],
        contactEmail: 'waterworks@civicconnect.gov',
        contactPhone: '+91 11 2345 6703',
      },
      {
        name: 'Electrical & Street Lighting',
        description: 'Illumination infrastructure, public lighting, and wire hazards.',
        categories: ['Street Light'],
        contactEmail: 'electrical@civicconnect.gov',
        contactPhone: '+91 11 2345 6704',
      },
    ]);

    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.name] = d._id;
    });

    console.log('[Seeder] Creating admin, staff, and citizen accounts...');
    // Admin
    const admin = await User.create({
      name: 'Chief Municipal Administrator',
      email: 'admin@civicconnect.gov',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 9811002233',
    });

    // Staff
    const roadStaff = await User.create({
      name: 'Rajesh Sharma',
      email: 'road.staff@civicconnect.gov',
      password: 'Staff@123',
      role: 'staff',
      department: deptMap['Road & Infrastructure'],
      phone: '+91 9822113344',
    });

    const wasteStaff = await User.create({
      name: 'Amit Patel',
      email: 'waste.staff@civicconnect.gov',
      password: 'Staff@123',
      role: 'staff',
      department: deptMap['Solid Waste Management'],
      phone: '+91 9833224455',
    });

    const waterStaff = await User.create({
      name: 'Sunita Verma',
      email: 'water.staff@civicconnect.gov',
      password: 'Staff@123',
      role: 'staff',
      department: deptMap['Water Supply & Sewerage'],
      phone: '+91 9844335566',
    });

    const electricStaff = await User.create({
      name: 'Vikram Singh',
      email: 'electric.staff@civicconnect.gov',
      password: 'Staff@123',
      role: 'staff',
      department: deptMap['Electrical & Street Lighting'],
      phone: '+91 9855446677',
    });

    // Citizens
    const citizen1 = await User.create({
      name: 'Priya Sharma',
      email: 'citizen@example.com',
      password: 'Citizen@123',
      role: 'citizen',
      phone: '+91 9876543210',
    });

    const citizen2 = await User.create({
      name: 'Rahul Mehta',
      email: 'rahul.citizen@example.com',
      password: 'Citizen@123',
      role: 'citizen',
      phone: '+91 9876543211',
    });

    console.log('[Seeder] Creating lifecycle complaints...');
    // 1. PENDING Complaint
    const c1 = await Complaint.create({
      complaintId: 'CC10001',
      title: 'Dangerous Deep Pothole on 5th Cross Road',
      description: 'Massive pothole causing two-wheeler skids especially during nighttime. Located right opposite the community grocery store.',
      category: 'Road Damage',
      priority: 'HIGH',
      status: 'PENDING',
      citizenId: citizen1._id,
      location: {
        address: '5th Cross Road, Indira Nagar, Ward 84, Bengaluru',
        latitude: 12.9716,
        longitude: 77.5946,
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
          publicId: 'seed_pothole_1',
        },
      ],
      statusHistory: [
        {
          status: 'PENDING',
          changedBy: citizen1._id,
          note: 'Complaint registered via citizen portal.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 3),
        },
      ],
    });

    // 2. VERIFIED Complaint
    const c2 = await Complaint.create({
      complaintId: 'CC10002',
      title: 'Non-functional Street Light Array near Children Park',
      description: 'Five consecutive street lamps have gone dark along the park boundary, creating safety concerns for pedestrians and evening joggers.',
      category: 'Street Light',
      priority: 'MEDIUM',
      status: 'VERIFIED',
      citizenId: citizen1._id,
      location: {
        address: 'Sector 4 Public Park Perimeter, HSR Layout, Bengaluru',
        latitude: 12.9121,
        longitude: 77.6446,
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80',
          publicId: 'seed_light_1',
        },
      ],
      statusHistory: [
        {
          status: 'PENDING',
          changedBy: citizen1._id,
          note: 'Submitted by citizen.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 4),
        },
        {
          status: 'VERIFIED',
          changedBy: admin._id,
          note: 'Verified by municipal inspection desk.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2),
        },
      ],
    });

    // 3. ASSIGNED Complaint
    const c3 = await Complaint.create({
      complaintId: 'CC10003',
      title: 'Potable Water Pipeline Rupture Flooding Walkway',
      description: 'Clean drinking water main supply line has fractured near the junction. Water is gushing onto the pedestrian path.',
      category: 'Water',
      priority: 'HIGH',
      status: 'ASSIGNED',
      citizenId: citizen2._id,
      departmentId: deptMap['Water Supply & Sewerage'],
      assignedStaffId: waterStaff._id,
      location: {
        address: '14th Main Road, Koramangala 4th Block, Bengaluru',
        latitude: 12.9352,
        longitude: 77.6245,
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80',
          publicId: 'seed_water_1',
        },
      ],
      statusHistory: [
        {
          status: 'PENDING',
          changedBy: citizen2._id,
          note: 'Submitted by citizen.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 2),
        },
        {
          status: 'VERIFIED',
          changedBy: admin._id,
          note: 'Verified complaint urgency.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24 * 1),
        },
        {
          status: 'ASSIGNED',
          changedBy: admin._id,
          note: 'Assigned to Water Supply & Sewerage team.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 18),
        },
      ],
    });

    // 4. IN_PROGRESS Complaint
    const c4 = await Complaint.create({
      complaintId: 'CC10004',
      title: 'Commercial Dumpster Overflowing at Vegetable Market',
      description: 'Uncollected organic and plastic refuse piling up for 4 consecutive days. Stray cattle and severe odor.',
      category: 'Garbage',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      citizenId: citizen1._id,
      departmentId: deptMap['Solid Waste Management'],
      assignedStaffId: wasteStaff._id,
      location: {
        address: 'Russell Market Area, Shivaji Nagar, Bengaluru',
        latitude: 12.9857,
        longitude: 77.6057,
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&auto=format&fit=crop&q=80',
          publicId: 'seed_garbage_1',
        },
      ],
      statusHistory: [
        {
          status: 'PENDING',
          changedBy: citizen1._id,
          note: 'Submitted by citizen.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 30),
        },
        {
          status: 'VERIFIED',
          changedBy: admin._id,
          note: 'Verified priority.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 20),
        },
        {
          status: 'ASSIGNED',
          changedBy: admin._id,
          note: 'Dispatched to sanitation crew.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 14),
        },
        {
          status: 'IN_PROGRESS',
          changedBy: wasteStaff._id,
          note: 'Compactor vehicle and cleaning crew arrived on scene.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 4),
        },
      ],
    });

    // 5. RESOLVED Complaint
    const c5 = await Complaint.create({
      complaintId: 'CC10005',
      title: 'Monsoon Stormwater Drain Overflowing',
      description: 'Silt accumulation causing stormwater drain backflow onto roadside.',
      category: 'Drainage',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      citizenId: citizen2._id,
      departmentId: deptMap['Water Supply & Sewerage'],
      assignedStaffId: waterStaff._id,
      location: {
        address: 'Outer Ring Road Service Lane, Marathahalli, Bengaluru',
        latitude: 12.9591,
        longitude: 77.6974,
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
          publicId: 'seed_drain_1',
        },
      ],
      resolutionImages: [
        {
          url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
          publicId: 'seed_resolution_1',
        },
      ],
      resolutionNote: 'Desilting machinery deployed. 200 meters of concrete canal cleared and free-flowing.',
      resolvedAt: new Date(Date.now() - 3600 * 1000 * 6),
      statusHistory: [
        {
          status: 'PENDING',
          changedBy: citizen2._id,
          note: 'Reported by citizen.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 48),
        },
        {
          status: 'VERIFIED',
          changedBy: admin._id,
          note: 'Verified.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 36),
        },
        {
          status: 'ASSIGNED',
          changedBy: admin._id,
          note: 'Assigned to Sunita Verma.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 24),
        },
        {
          status: 'IN_PROGRESS',
          changedBy: waterStaff._id,
          note: 'Desilting team in action.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 12),
        },
        {
          status: 'RESOLVED',
          changedBy: waterStaff._id,
          note: 'Debris completely excavated and water flowing smoothly.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 6),
        },
      ],
    });

    // 6. CLOSED Complaint
    const c6 = await Complaint.create({
      complaintId: 'CC10006',
      title: 'Dislodged Rubber Speed Breaker Segment',
      description: 'Screws came loose on rubber speed hump creating protruding metal hazard.',
      category: 'Road Damage',
      priority: 'LOW',
      status: 'CLOSED',
      citizenId: citizen1._id,
      departmentId: deptMap['Road & Infrastructure'],
      assignedStaffId: roadStaff._id,
      location: {
        address: 'CMH Road, Indiranagar 1st Stage, Bengaluru',
        latitude: 12.9784,
        longitude: 77.6408,
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
          publicId: 'seed_speed_1',
        },
      ],
      resolvedAt: new Date(Date.now() - 3600 * 1000 * 10),
      closedAt: new Date(Date.now() - 3600 * 1000 * 2),
      statusHistory: [
        {
          status: 'PENDING',
          changedBy: citizen1._id,
          note: 'Reported.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 72),
        },
        {
          status: 'VERIFIED',
          changedBy: admin._id,
          note: 'Verified.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 60),
        },
        {
          status: 'ASSIGNED',
          changedBy: admin._id,
          note: 'Assigned to road maintenance.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 48),
        },
        {
          status: 'IN_PROGRESS',
          changedBy: roadStaff._id,
          note: 'Crew re-anchored bolts.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 20),
        },
        {
          status: 'RESOLVED',
          changedBy: roadStaff._id,
          note: 'Replacement hump segment secured.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 10),
        },
        {
          status: 'CLOSED',
          changedBy: citizen1._id,
          note: 'Citizen confirmed satisfactory resolution.',
          timestamp: new Date(Date.now() - 3600 * 1000 * 2),
        },
      ],
    });

    console.log('[Seeder] Creating realistic user notifications...');
    await Notification.create([
      {
        userId: citizen1._id,
        complaintId: c2._id,
        customComplaintId: c2.complaintId,
        title: 'Complaint Verified',
        message: `Your complaint ${c2.complaintId} has been verified.`,
        type: 'VERIFIED',
        isRead: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 2),
      },
      {
        userId: citizen1._id,
        complaintId: c4._id,
        customComplaintId: c4.complaintId,
        title: 'Work Started',
        message: `Work has started on complaint ${c4.complaintId}.`,
        type: 'WORK_STARTED',
        isRead: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 4),
      },
      {
        userId: citizen2._id,
        complaintId: c3._id,
        customComplaintId: c3.complaintId,
        title: 'Complaint Assigned',
        message: `Your complaint ${c3.complaintId} has been assigned to the concerned department.`,
        type: 'ASSIGNED',
        isRead: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 18),
      },
      {
        userId: citizen2._id,
        complaintId: c5._id,
        customComplaintId: c5.complaintId,
        title: 'Complaint Resolved',
        message: `Your complaint ${c5.complaintId} has been resolved.`,
        type: 'RESOLVED',
        isRead: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 6),
      },
      {
        userId: waterStaff._id,
        complaintId: c3._id,
        customComplaintId: c3.complaintId,
        title: 'New Complaint Assigned',
        message: `Complaint ${c3.complaintId} has been assigned to you.`,
        type: 'ASSIGNED',
        isRead: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 18),
      },
      {
        userId: admin._id,
        complaintId: c1._id,
        customComplaintId: c1.complaintId,
        title: 'New Complaint',
        message: `Complaint ${c1.complaintId} has been submitted.`,
        type: 'NEW_COMPLAINT',
        isRead: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 24 * 3),
      },
    ]);

    console.log('=====================================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log(' Sample Credentials:');
    console.log(' - Admin:   admin@civicconnect.gov         / Admin@123');
    console.log(' - Staff:   water.staff@civicconnect.gov   / Staff@123');
    console.log(' - Staff:   road.staff@civicconnect.gov    / Staff@123');
    console.log(' - Citizen: citizen@example.com            / Citizen@123');
    console.log(' - Citizen: rahul.citizen@example.com      / Citizen@123');
    console.log('=====================================================');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]', error);
    process.exit(1);
  }
};

seedData();
