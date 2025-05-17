const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');

// Routes
router.post('/activity', activityController.createActivity);
router.get('/activity/:userId', activityController.getUserActivities);
router.get('/activities', activityController.getAllActivities);

module.exports = router;
