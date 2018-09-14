"use strict";

const path = require('path');
const TaskNamespace = require(path.join(__dirname, './task_namespace.js'));

/**
 * 概要: アクションの抽象クラス
 */
module.exports = class AbstractTask extends TaskNamespace {
  // 配列で受け取っているが、文字列で受け取り、加工する処理を入れたい。
  set taskArgs(val){
    this.args = val;
  }

  set dbConnection(val){
    this.sequelize = val;
  }

  // 前処理 protected
  async before(){}

  // メイン処理 protected
  async main(){
    throw new Error("Need to extends main.");
  }

  // 後処理 protected
  async after(){}

  // 絶対に処理 protected
  async finally(){
  }

  // エラー時に処理 protected
  async error(e){
    console.log(this.getFullTaskName(), e);
  }

  // 実行
  async execute(){
    try {
      await this.before();
      await this.main();
      await this.after();
    } catch(e) {
      await this.error(e);
    } finally {
      await this.finally();
    }
  }
}
