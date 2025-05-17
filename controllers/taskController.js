const Task = require("../models/Task");
const User = require("../models/User");
// we will write all crud operations of task here
// Create a new task
exports.createTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority, assignedTo } = req.body;
        const task = new Task({
            title,
            description,
            dueDate,
            priority,
            createdBy: req.user._id, // Set the task creator to the logged-in user
            assignedTo: assignedTo || null
        });

    const io = req.app.get("io");

    if (assignedTo) {
      // Real-time push
      io.to(assignedTo.toString()).emit("notification", {
        message: `You have been assigned a new task: ${task.title}`,
        taskId: task._id
      });

      // Optional DB log and save in db
      const Notification = require("../models/Notification");
      await Notification.create({
        user: assignedTo,
        message: `You have been assigned a new task: ${task.title}`,
        task: task._id
      });
    }

        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Get all tasks assigned to the current user
exports.getTasks = async (req, res) => {
  
    try {
        let tasks;

        if (req.user.role === 'admin') {
            // Admin gets all tasks
            tasks = await Task.find({});
        } else {
            // Regular user gets only tasks created by or assigned to them
            tasks = await Task.find({
                $or: [
                    { createdBy: req.user._id },
                    { assignedTo: req.user._id }
                ]
            });
        }

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};



// Get a specific task by ID
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Update task status or other fields
exports.updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Only allow task updates if the current user is the creator or assigned
        if (task.createdBy.toString() !== req.user._id.toString() && task.assignedTo.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        const { title, description, dueDate, priority, status, assignedTo } = req.body;
        task.title = title || task.title;
        task.description = description || task.description;
        task.dueDate = dueDate || task.dueDate;
        task.priority = priority || task.priority;
        task.status = status || task.status;
        task.assignedTo = assignedTo || task.assignedTo;

        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

// task statistics
exports.getTaskStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Tasks created by the user
    const tasksCreated = await Task.countDocuments({ createdBy: userId });

    // Tasks assigned to the user
    const tasksAssigned = await Task.countDocuments({ assignedTo: userId });

    // Overdue tasks (tasks assigned to the user or created by the user that are not completed and past the due date)
    const overdueTasks = await Task.countDocuments({
      $or: [
        { assignedTo: userId, status: { $ne: "Completed" }, dueDate: { $lt: moment().toDate() } },
        { createdBy: userId, status: { $ne: "Completed" }, dueDate: { $lt: moment().toDate() } },
      ]
    });

    // Tasks by status (Pending, In Progress, Completed)
    const taskStatusCount = await Task.aggregate([
      { $match: { $or: [{ createdBy: userId }, { assignedTo: userId }] } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Tasks by priority (Low, Medium, High)
    const taskPriorityCount = await Task.aggregate([
      { $match: { $or: [{ createdBy: userId }, { assignedTo: userId }] } },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    // Respond with the statistics
    res.json({
      tasksCreated,
      tasksAssigned,
      overdueTasks,
      taskStatusCount,
      taskPriorityCount,  // Added priority breakdown
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getTasksByStatus=async (req,res)=>{
     const { status } = req.query;

  if (!status) {
    return res.status(400).json({ error: "Status query parameter is required" });
  }

  try {
    const tasks = await Task.find({ status: status.toLowerCase() });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching tasks" });
  }
}