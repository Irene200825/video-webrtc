//引入express
const express = require("express");

//cookie-parser中间件会自动把客户端发送过来的cookie解析到request对象上
const cookieParser = require("cookie-parser");
const session = require("express-session");


//1.创建app服务对象
const app = express();

const expressWs = require("express-ws");
expressWs(app); //将express实例上绑定 websocket 的一些方法

app.use(express.json()); // 会自动加入req.body属性，这个属性中就包含了post请求所传入的参数
app.use(cookieParser());

app.use(
  session({
    name: "test_session", // 这里是cookie的name，默认是connect.sid
    secret: "my_session_secret", // 建议使用 128 个字符的随机字符串
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000, httpOnly: true }
  })
);

const prefix = "/media";
const HttpResult = require("./utils/httpResult.js");
const {
  FindOne,
  Insert,
  Update,
  Aggregate,
  MapReduce,
  Delete,
  ObjectId,
} = require("./mongodb/db.js");

/**
 * 创建用户 {name:"anzi",password:123456}
 */
app.post(prefix + "/createUser", async function(request, response) {
  let data = request.body;

  try {
    let users = await FindOne("media", "user", { name: data.name });
    if (users.length > 0) {
      response.send(HttpResult.Error(20003, "用户名已存在"));
      return;
    }
    await Insert("media", "user", {
      name: data.name,
      password: data.password,
      nickname: "",
    });
    response.send(HttpResult.Success("注册成功"));
  } catch (error) {
    response.send(HttpResult.Error(20001, error.message || "注册失败"));
  }
});

/**
 * 用户登录 {name:"anzi",password:123456}
 */
app.post(prefix + "/login", async function(request, response) {
  let data = request.body;

  try {
    let users = await FindOne("media", "user", { name: data.name });
    if (users.length === 0) {
      response.send(HttpResult.Error(20005, "用户名不存在，请先注册"));
      return;
    }

    if (users[0].password !== data.password) {
      response.send(HttpResult.Error(20006, "用户名或密码错误"));
      return;
    }

    request.session.isLogin = true; 
    request.session.userName = users[0].name;
    request.session.userId = users[0]._id;
    request.session.uid = 1;
    console.log(request,request.session)
    response.cookie("sessionId", request.session.id, { maxAge: 600000, path: "/" });

    response.send(HttpResult.Success("登录成功", users[0]));
  } catch (error) {
    response.send(HttpResult.Error(20001, error.message || "登录失败"));
  }
});

/**
 * 编辑用户 {name:"anzi",password:123456}
 */
app.post(prefix + "/editUser", async function(request, response) {
  if (!request.session.isLogin) {
    response.send(HttpResult.Error(20002, "登录信息过期"));
    return;
  }

  let data = request.body;
  let id = data._id;
  delete data._id;
  try {
    await Update("media", "user", id, data);
    response.send(HttpResult.Success("编辑成功"));
  } catch (error) {
    response.send(HttpResult.Error(20001, error.message || "编辑失败"));
  }
});

/**
 * 用户列表获取
 */
app.get(prefix + "/getUser", async function(request, response) {
  if (!request.session.isLogin) {
    response.send(HttpResult.Error(20002, "登录信息过期"));
    return;
  }
  const data = request.query;
  try {
    let users = await FindOne("media", "user", data);
    response.send(HttpResult.Success("用户获取成功", users));
  } catch (error) {
    response.send(HttpResult.Error(20001, error.message || "用户获取失败"));
  }
});

/**
 * 打点量 {_id,userId,pageUrl,createAt}
 */
app.post(prefix + "/track", async function(request, response) {
  const userId = request.session.userId;
  const data = request.body;
  try {
    await Insert("media", "track", {
      userId,
      pageUrl: data.pageUrl,
      createAt: new Date(),
    });
    response.send(HttpResult.Success("打点成功"));
  } catch (error) {
    response.send(HttpResult.Error(20001, error.message || "打点失败"));
  }
});

/**
 * 获取访问量 {_id,userId,pageUrl,createAt}
 */
app.get(prefix + "/track", async function(request, response) {
  if (!request.session.isLogin) {
    response.send(HttpResult.Error(20002, "登录信息过期"));
    return;
  }

  try {
    let result = await Aggregate("media", "track", [
      {
        $match: {
          createAt: {
            $gt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      { $project: { createAt: { $substr: ["$createAt", 0, 10] } } },
      { $group: { _id: "$createAt", number: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    response.send(HttpResult.Success("查询成功", result));
  } catch (error) {
    response.send(HttpResult.Error(20001, error.message || "查询失败"));
  }
});

/**
 * 获取近七日用户访问量 {_id,userId,pageUrl,createAt}
 */
app.get(prefix + "/track/user", async function(request, response) {
  if (!request.session.isLogin) {
    response.send(HttpResult.Error(20002, "登录信息过期"));
    return;
  }
  try {
    let result = await Aggregate("media", "track", [
      {
        $match: {
          createAt: {
            $gt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
          },
          userId: {
            $ne: null,
          },
        },
      },
      {
        $project: {
          createAt: { $substr: ["$createAt", 0, 10] },
          userId: "$userId",
        },
      },
      {
        $group: {
          _id: "$createAt",
          userIds: { $addToSet: "$userId" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    response.send(
      HttpResult.Success(
        "查询成功",
        result.map((item) => {
          return {
            _id: item._id,
            number: item.userIds.length,
          };
        })
      )
    );
  } catch (error) {
    response.send(HttpResult.Error(20001, error.message || "查询失败"));
  }
});

/**
 * 获取聊天记录
 * {groupId:""}或{userId:""}
 *  message userId groupId toUserId createAt
 */
app.post(prefix + "/historyChats", async function(request, response) {
  // if (!request.session.isLogin) {
  //   response.send(HttpResult.Error(20002, "登录信息过期"));
  //   return;
  // }

  const data = request.body;
  const userId = request.session.userId;
  let params = {};
  if (data.groupId) {
    params = {
      groupId: data.groupId,
    };
  } else {
    params = {
      $or: [
        { userId:data.userId, toUserId: data.toUserId },
        { userId: data.toUserId, toUserId: data.userId },
      ],
    };
  }

  try {
    let chats = await FindOne("media", "chats", params);
    response.send(HttpResult.Success("获取聊天记录成功", chats));
  } catch (error) {
    response.send(HttpResult.Error(20001, "获取聊天记录失败"));
  }
});

/**
 * 聊天接口
 * 测试http://www.toolnb.com/tools/webSocketTools.html?no_https
 * {"message":"您好","userId":"111","groupId":"222","toUserId":"1111","type":1 }
 * type 1用户上线
 */

/**
 * 创建群 {name:"anzi"}
 */
app.post(prefix + "/createGroup", async function(request, response) {
  if (!request.session.isLogin) {
    response.send(HttpResult.Error(20002, "登录信息过期"));
    return;
  }

  let data = request.body;

  try {
    let groups = await FindOne("media", "group", { name: data.name });
    if (groups.length > 0) {
      response.send(HttpResult.Error(20007, "群名称已经存在"));
      return;
    }
    await Insert("media", "group", { name: data.name });
    groups = await FindOne("media", "group", { name: data.name });
    response.send(HttpResult.Success("群创建成功", groups));
  } catch (error) {
    response.send(HttpResult.Error(20001, error.message || "群创建失败"));
  }
});

/**
 * 群列表获取
 */
app.get(prefix + "/getGroup", async function(request, response) {
  if (!request.session.isLogin) {
    response.send(HttpResult.Error(20002, "登录信息过期"));
    return;
  }

  try {
    let groups = await FindOne("media", "group", {});
    response.send(HttpResult.Success("群获取成功", groups));
  } catch (error) {
    response.send(HttpResult.Error(20001, error.message || "群获取失败"));
  }
});

/**
 * 删除群
 */
app.post(prefix + "/deleteGroup", async function(request, response) {
  if (!request.session.isLogin) {
    response.send(HttpResult.Error(20002, "登录信息过期"));
    return;
  }

  let data = request.body;

  try {
    await Delete("media", "group", { _id: new ObjectId(data.id) });
    response.send(HttpResult.Success("群删除成功"));
  } catch (error) {
    response.send(HttpResult.Error(20001, error.message || "群删除失败"));
  }
});

class ChatRoomManage {
  constructor() {
    this.inlineUsers = []; //上线用户
    this.groupUsers = {};
  }

  /**
   * 用户上线
   * @param {*} userId
   * @returns
   */
  addInlineUsers(userId, userName, connect) {
    let index = this.inlineUsers.findIndex((user) => user.userId === userId);
    if (index === -1) {
      this.inlineUsers.push({ userName, userId, connect });
      return;
    }
    this.inlineUsers[index].connect = connect;
  }

  /**
   * 用户下线
   * @param {*} userId
   * @returns
   */
  deleteInlineUsers(userId) {
    let index = this.inlineUsers.findIndex((user) => user.userId === userId);
    if (index === -1) {
      return;
    }
    this.inlineUsers.splice(index, 1);
  }

  sendMessage(userIds, message) {
    this.inlineUsers.forEach((user) => {
      if (userIds.some((userId) => userId === user.userId)) {
        user.connect.send(JSON.stringify(message));
      }
    });
  }
}

const chatRoomManage = new ChatRoomManage();
app.ws("/chatRoom", (ws, request) => {
  ws.on("close", function(msg) {
    console.log("离线的小可爱",msg)
    // chatRoomManage.deleteInlineUsers(data.userId);
  });
  ws.on("message", async function(msg) {
    if (!msg) {
      return;
    }
    try {
      const data = JSON.parse(msg);
      //链接
      if(data.type===1){
        chatRoomManage.addInlineUsers(data.userId, data.userName, ws);
        return;
      }
      if(data.type===3){
        console.log("离线的小可爱3333")
        chatRoomManage.deleteInlineUsers(data.userId);
        return;
      }
      if (!data.groupId && !data.toUserId) {
        return;
      }
      const result = {
        // type: data.type,
        message: data.message,
        userId: data.userId,
        userName:data.userName,
        groupId: data.groupId,
        toUserId: data.toUserId,
        createAt: new Date(),
      };
   
      Insert("media", "chats", result);

      let sendUsers = []
      if(!data.groupId){
        sendUsers = [result.userId, result.toUserId]
      }else{
        const users = await FindOne("media", "user", {});
        console.log(users)
        sendUsers =  users.map((user)=>user._id.toString());
        console.log(sendUsers)
      }

      chatRoomManage.sendMessage(
        sendUsers,
        result
      );
    } catch (error) {
      console.log(error);
    }
  });
});

//3.指定服务器运行的端口号(绑定端口监听)
app.listen(3000, function(err) {
  if (!err) console.log("服务器启动成功了,http://localhost:3000/");
  else console.log(err);
});
