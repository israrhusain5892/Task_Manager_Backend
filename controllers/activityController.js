const Activity = require('../models/Activity');

// Add a new activity
exports.createActivity = async (req, res) => {
  try {
    const { userId, action, taskId } = req.body;
    const newActivity = new Activity({ userId, action, taskId });
    const savedActivity = await newActivity.save();
    res.status(201).json(savedActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get recent activities for a user
exports.getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;
    const activities = await Activity.find({ userId })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('taskId');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all activities (any user)
exports.getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ timestamp: -1 })
      .populate('taskId');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

