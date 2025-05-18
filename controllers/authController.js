const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Task = require('../models/Task');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

exports.register = async (req, res) => {
  try {
    console.log(req.body)
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const user = await User.create({ name, email, password, role });
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role,token:token } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};



exports.getAllUsers=async (req,res)=>{
     try {
    // Fetch all users
    const users = await User.find();

    // For each user, fetch their tasks
    const usersWithTasks = await Promise.all(
      users.map(async (user) => {
        const tasks = await Task.find({ assignedTo: user._id });
        return {
           ...user.toObject(), // Convert Mongoose document to plain JS object
          tasks,
          
        };
      })
    );

    res.status(200).json(usersWithTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}





