"use strict";

const path = require('path');
const AbstractTask = require(path.join(__dirname, 'concerns/abstract_task.js'));

const namespace = null;

/**
 * 概要: DBの更新
 */
class UpdateDbTask extends AbstractTask {
  namespace(){
    return namespace;
  }

  // 前処理
  async before(){
  }

  // メイン処理
  async main(){
    await sequelize
      .sync({force: false, alter: true})
      .then(() =>{
        console.log("Update DB.");
      }).catch((error) =>{
        console.log("[ERROR]" + error);
      });
  }

  // 後処理
  async after(){}

  // 絶対に処理
  async finally(){
  }
}

module.exports = [UpdateDbTask];