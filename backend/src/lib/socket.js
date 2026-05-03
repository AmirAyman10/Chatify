import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket_auth_middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});
//apply authentication middleware to socket.io connections
io.use(socketAuthMiddleware);

// real time messages
//check if receiver is online or not
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
 }

//storing online users
const userSocketMap = {}; //userId: socketId

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id; //map userId to socketId

  // send event to all clients with updated online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  //handle disconnected users
  socket.on("disconnect", () => {
    console.log("A user disconnected: ", socket.user.fullName);
    delete userSocketMap[userId]; //remove user from online users map
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); //update online users list
  });
});
export { io, app, server };
