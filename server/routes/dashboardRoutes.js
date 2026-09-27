const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticateUser } = require('../middleware/auth');

router.use(authenticateUser);

router.get('/stats', getDashboardStats);

module.exports = router;
