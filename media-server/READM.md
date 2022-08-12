# mongodb
## mac电脑安装 https://www.runoob.com/mongodb/mongodb-osx-install.html
## 参考资料  https://www.runoob.com/nodejs/nodejs-mongodb.html

## 启动
`
mongod --dbpath /usr/local/var/mongodb --logpath /usr/local/var/log/mongodb/mongo.log --fork
`

## 是否启动成功
`
 ps aux | grep -v grep | grep mongod

 //杀进程
 sudo kill  9165
`

## 通过配置文件启动
`
vim /usr/local/etc/mongod.conf

dbpath=E:\MongoDb\data\db # 数据库文件
logpath=E:\MongoDB\log\mongodb.log # 日志文件
logappend=true # 日志采用追加模式，配置后mongodb日志会追加到现有的日志文件，不会重新创建一个新文件
journal=true # 启用日志文件，默认启用
quiet=true # 这个选项可以过滤掉一些无用的日志信息，若需要调试使用请设置为 false
port=27016 # 端口号 默认为 27017
`

mongod -f /usr/local/etc/mongod.conf


## 验证启动成功
浏览器打开http://localhost:27016/

It looks like you are trying to access MongoDB over HTTP on the native driver port.


# 接口
## express 服务
## router 中间件 主要是把相关的业务拆分开,方便开发和后期维护,实现高内聚低耦合
## cookie-parser  中间件 会自动把客户端发送过来的cookie解析到request对象上
## express-session 中间件 处理session，将会话数据存储在服务器上；它仅将会话标识（而非会话数据）保存在 cookie 中
## express-ws 将express实例上绑定 websocket 的一些方法
## 在线调试websocket http://www.toolnb.com/tools/webSocketTools.html?no_https


# chatRoom设计,模拟微信进行聊天
## 支持一对一聊天
## 支持群聊
## 数据库设计   
### 分为左右两侧，左边是用户和群，右侧是聊天界面
### 顶部有个添加群的按钮，弹窗添加群
### 点击用户和群，聊天界面加载历史记录，然后接收当前消息





 