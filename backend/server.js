<<<<<<< HEAD
import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";
import { app, server } from "./socket/socket.js";  // Import socket server

dotenv.config(); // Loads the environment variables

console.log("Mongo URI:", process.env.MONGO_URI);  // Check if the URI is correctly loaded

// MongoDB connection
const connectToMongoDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log("Error connecting to MongoDB:", err));
};

const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // to parse the incoming requests with JSON payloads (from req.body)
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, "/frontend/dist")));

// Catch-all route to serve frontend index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

// Start the server and MongoDB connection
server.listen(PORT, () => {
  connectToMongoDB();  // Ensure MongoDB connection is established when the server starts
  console.log(`Server Running on port ${PORT}`);
=======
require('dotenv').config(); // Load environment variables

console.log("MONGODB_URI:", process.env.MONGODB_URI); // Log the value to see if it's loaded correctly

const express = require("express");
const mongoose = require("mongoose"); // Import mongoose here
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");

const app = express();
app.use(express.json());

// Ensure the MongoDB URI is loaded correctly
if (!process.env.MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not defined in the .env file");
  process.exit(1); // Exit if MongoDB URI is not found
}

// Log MONGODB_URI to verify if it is loaded properly
console.log("MONGODB_URI: ", process.env.MONGODB_URI);


// Connect to the database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => {
    console.error("MongoDB connection error: ", err);
    process.exit(1); // Exit if MongoDB connection fails
  });


// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------------deployment------------------------------

// Serve static files for production
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/frontend/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// --------------------------deployment------------------------------

// Error Handling middlewares
app.use(notFound);
app.use(errorHandler);

// Set PORT from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

// Setup socket.io
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
    socket.userData = userData;
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    if (socket.userData) {
      socket.leave(socket.userData._id);
    }
  });
>>>>>>> d252805b7bec151c64d983c4140333723f56569f
});
