const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Valkey = require("ioredis");
const { channel } = require("process");
require("dotenv").config();

const serviceUri = process.env.REDIS_URL || "";

const valkey = new Valkey(serviceUri);
valkey.on("error", (err) => {
  console.log(err);
});
valkey.on("connect", () => {
  console.log("connected to redis");
});

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

function initSubscriber() {
  valkey.subscribe("test");

  valkey.on("message", (channel, message) => {
    console.log(`Message received on channel ${channel}:`, message);
    io.emit("message", message);
  });
}

initSubscriber();

io.on("connection", (socket) => {
  console.log("New Connection", socket.id);
  socket.on("disconnect", () => {
    console.log("Disconnected", socket.id);
  });
  socket.on("message", (data) => {
    console.log(data);
  });
  socket.on("test", (data) => {
    console.log(`from ${data}`);
  });
  socket.emit("test", "Hello");
});

app.get("/", (req, res) => {
  res.json({
    msg: "Hello",
  });
});

server.listen(3000, () => {
  console.log("Listening on port 3000");
});
