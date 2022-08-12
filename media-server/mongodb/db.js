//1.数据库 MongoClient.connect
//2.集合
const { ObjectId, MongoClient } = require("mongodb");
const url = "mongodb://localhost:27016/";

/**
 * 封装find()查询所有数据
 * @param {*} table 数据库名称
 * @param {*} collect  集合名
 * @returns
 */
exports.FindAll = function findAll(table, collect) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(table);
      dbo
        .collection(collect)
        .find()
        .toArray(function(err, result) {
          // 返回集合中所有数据
          if (err) {
            reject(err);
          } else {
            resolve(result);
            db.close();
          }
        });
    });
  });
};

/**
 * 查询某一条记录
 * @param {*} table
 * @param {*} collect
 * @param {*} params
 * @returns
 */
exports.FindOne = function findone(table, collect, params) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(table);
      dbo
        .collection(collect)
        .find(params)
        .toArray(function(err, result) {
          // 返回集合中所有数据
          if (err) {
            reject(err);
          } else {
            resolve(result);
            db.close();
          }
        });
    });
  });
};

/**
 * 获取聚合内容
 * @param {*} table
 * @param {*} collect
 * @param {*} params
 * @returns
 */
 exports.Aggregate = function aggregate(table, collect, params) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(table);
        dbo
        .collection(collect).aggregate(params)
        .toArray(function(err, result) {
          // 返回集合中所有数据
          if (err) {
            reject(err);
          } else {
            resolve(result);
            db.close();
          }
        });
    });
  });
};


/**
 * 获取内容
 * @param {*} table
 * @param {*} collect
 * @param {*} params
 * @returns
 */
//  exports.MapReduce = function mapReduce(table, collect, mapCallback,reduceCallBack,options) {
//   return new Promise((resolve, reject) => {
//     MongoClient.connect(url, function(err, db) {
//       if (err) throw err;
//       var dbo = db.db(table);
//       dbo.collection(collect).mapReduce(
//           mapCallback,  //map 函数
//           reduceCallBack,   //reduce 函数
//           options
//         ).then((result)=>{
//           console.log("=====",db.post_total.find())
          
//         })
//         // console.log("=====",result)
//         // db[result.result].find().toArray(function(err, result) {
//         //   // 返回集合中所有数据
//         //   if (err) {
//         //     reject(err);
//         //   } else {
//         //     resolve(result);
//         //     db.close();
//         //   }
//         // });
//     });
//   });
// };




/**
 * 获取数量
 * @param {*} table
 * @param {*} collect
 * @param {*} params
 * @returns
 */
 exports.Count = function countDocuments(table, collect, params) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(table);
      dbo
        .collection(collect).countDocuments(params, function(err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
            db.close();
          }
        })
    });
  });
};

/**
 * 封装更新方法
 * @param {*} table
 * @param {*} collect
 * @param {*} id
 * @param {*} newdata
 * @returns
 */

exports.Update = function update(table, collect, id, newdata) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(table);
      dbo
        .collection(collect)
        .updateOne({_id:new ObjectId(id)}, { $set: {...newdata}}, function(err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
            db.close();
          }
        });
    });
  });
};

/**
 * 封装插入数据方法
 * @param {*} table
 * @param {*} collect
 * @param {*} data
 * @returns
 */
exports.Insert = function insert(table, collect, data) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(table);
      dbo.collection(collect).insertOne(data, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
          db.close();
        }
      });
    });
  });
};
/**
 * 封装删除的方法
 * @param {*} table
 * @param {*} collect
 * @param {*} params
 * @returns
 */
exports.Delete = function deleteOne(table, collect, params) {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db(table);
      dbo.collection(collect).deleteOne(params, function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
          db.close();
        }
      });
    });
  });
};

exports.ObjectId = ObjectId;
