const express = require("express");
const {createTask,getTaskById,updateTask,deleteTask,getTasks,getTaskStatistics } = require("../controllers/taskController");
const router = express.Router();
const { authenticateUser, authorizeRoles } = require("../middleWare/authMiddleWare");
// Create a new task
router.post("/",authenticateUser,authorizeRoles("admin"), createTask);

// Get all tasks assigned to or created by the current user and protect route bu only user authentication
router.get("/", authenticateUser,getTasks);

// Get a specific task by ID and protect route
router.get("/:id",authenticateUser, getTaskById);

// Update a task (status, assigned user, etc.) protect rouite by admin role
router.put("/:id",authenticateUser,authorizeRoles("admin"), updateTask);

// Delete a task
router.delete("/:id",authenticateUser,authorizeRoles("admin","Manager"), deleteTask);

// get task statistics
router.get("/taskStatics",authenticateUser,authorizeRoles("admin","Manager"),getTaskStatistics);

module.exports = router;