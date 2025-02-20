const express = require("express");
const mongoose = require("mongoose");
const Task = require("./src/models/task.model");
const cors = require("cors");
const User = require("./src/models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Step 1 : Creating an express server
app.listen(8080, () => {
  console.log("[server] : running on port 8080");
  connectDB();
});

// Step 2 : Connecting to MongoDB through mongoose
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[server] : mongo connected");
  } catch (err) {
    console.log("[server] : error connecting to Mongo Atlas", err);
  }
}

// Step 3 : Creating API's

app.get("/", (req, res) => {
  res.send("Welcome to my server");
});

app.post("/create", async (req, res) => {
  const { title, desc, status } = req.body;
  const task = await Task.create({
    title,
    desc,
    status,
  });

  res.send({
    message: "Your task is created",
    task,
  });
});

// READ
app.get("/read", async (req, res) => {
  const tasks = await Task.find({});
  res.send({
    message: "Here are your tasks",
    tasks,
  });
});

// DELETE
app.delete("/tasks/:id", async (req, res) => {
  console.log(req.params.id);
  const task = await Task.findByIdAndDelete(req.params.id);
  res.send({
    message: "Task deleted",
    task,
  });
});

// UPDATE
app.patch("/tasks/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.send({
    message: "Task Updated",
    task,
  });
});

// Register
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  let user = await User.findOne({ email });

  if (user)
    res.status(400).send({
      message: "User exisits, please login",
    });

  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);

  user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  res.status(200).send({
    message: "User created",
    user,
  });
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let user = await User.findOne({ email });

  if (!user)
    return res.status(400).send({
      message: "User not registered, please signup",
    });

  const match = bcrypt.compareSync(password, user.password);

  if (!match)
    res.status(400).send({
      message: "Invalid credentials",
    });

  // If password matches, generate jwt and respond
  const token = jwt.sign(user.email, process.env.JWT_SECRET);
  const decoded = jwt.verify(token, "secretkey");

  console.log(decoded);

  return res.status(200).send({
    message: "Login was successfull",
    token,
  });
});
