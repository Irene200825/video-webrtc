/**
 * webpack  配置文件
 */
const path = require("path");

module.exports = {
  target: "node",
  //调试时使用development开发模式
  //打包时使用production生产模式
  mode: "development",
  entry: path.join(__dirname, "./index.js"), //__dirname表示当前目录当前路径
  output: {
    path: path.join(__dirname, "./dist"),
    filename: "bundle.js",
  }
};
