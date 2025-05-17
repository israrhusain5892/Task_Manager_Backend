
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const {authenticateUser}=require("./middleWare/authMiddleWare");
const activityRoutes = require('./routes/activityRoutes');
const app = express();
connectDB();

app.use(cors());
// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", authenticateUser, require("./routes/taskRoutes"));
app.use("/",authenticateUser,require("./routes/notificationRoutes"))
app.use('/api',authenticateUser, activityRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// connection for websocket
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
app.set("io", io);


// User Api:
        //  1. Register: /api/auth/register
        // 2. Login: /api/auth/login

// Tasks Api end point:
//    1. post task: /api/tasks/
//     2. get Tasks:/api/tasks/
//     3. get Task by Id: /api/tasks/:id
//     4. update Task: /api/tasks/:id
//     5. Delete Task: /api/tasks/:Id
//     6. get Task Statistics: /api/tasks/taskStatics