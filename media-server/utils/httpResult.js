const ERROR_CODE = {
  20001: "服务错误",
  20002: "登录信息过期",
  20003: "用户名已存在",
  20004: "注册失败",
  20005: "用户名不存在，请先注册",
  20006: "用户名或密码错误",
  20007: "群名称已经存在"
};



exports.Error = function(code, message) {
  return {
    code,
    message: message || ERROR_CODE[code],
  };
};

exports.Success  = function(message,data) {
    return {
      code:20000,
      message: message,
      data
    };
};
