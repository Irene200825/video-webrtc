var http = require("http");
const { emit } = require("process");
var socket = require("socket.io");

module.exports = (app) => {
  let server = http.Server(app);
  let io = socket(server);
  io.sockets.on("connection", (socket) => {
    socket.on("disconnecting", () => {
      // 通知房间中的其他客户端断开连接
      socket.rooms.forEach((room) => {
        socket.broadcast.to(room).emit("message", {
          room: room,
          socketId: socket.id,
          type: "disconnecting",
        });
      });
    });

    // 转发客户端消息
    socket.on("message", function(target, message) {
      if (target) {
        io.sockets.sockets.get(target).emit("message", message);
      }
    });

    // 房间创建与加入
    socket.on("join", function({ room ,userName}) {
      const clientsInRoom = io.sockets.adapter.rooms.get(room);
      const numClients = clientsInRoom ? clientsInRoom.size : 0;
      if (numClients === 0) {
        // 创建房间
        socket.join(room);
        // 通知当前客户端创建房间成功
        socket.emit("message", {
          room: room,
          socketId: socket.id,
          type: "joined",
        });
      } else if (numClients < 10) {
        // 一个房间最多只能有10个人
        socket.join(room);
        // 通知当前客户端加入房间成功
        socket.emit("message", {
          room: room,
          socketId: socket.id,
          type: "joined",
        });
        // 通知房间中的其他客户端有人加入
        socket.broadcast.to(room).emit("message", {
          room: room,
          socketId: socket.id,
          userName,
          type: "otherJoined",
        });
      } else {
        // max two clients
        socket.emit("message", {
          room: room,
          socketId: socket.id,
          type: "full",
        });
      }
    });
  });

  server.listen(3001, function(err) {
    if (!err) console.log("服务器启动成功了,http://localhost:3001/");
    else console.log(err);
  });
};
