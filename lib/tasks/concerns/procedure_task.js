"use strict";

const path = require('path');
const AbstractTask = require(path.join(__dirname, 'abstract_task.js'));

/**
 * 概要: アクションの抽象クラス
 */
module.exports = class ProcedureTask extends AbstractTask {
  // 各プロセス毎のスリープ時間 protected
  getProcessSleepTime(){
    return 0;
  }

  // 対象ユーザに対して、処理する元の値を返却する。 protected
  async readyDatas(){
    throw new Error("Need to extends readyDatas.");
  }

  // 一要素に対して処理を行う protected
  async process(data){
    throw new Error("Need to extends process.");
  }

  // 要素処理が終わったら
  async processAllEnd(){}

  // エラー処理 protected
  async processError(e){
    if (e instanceof ERROR.NotFoundPage) {
      logger.error(this.getFullTaskName(), e);
    } else if (e instanceof ERROR.NotFoundElement) {
      logger.error(this.getFullTaskName(), e);
    } else if (e instanceof ERROR.InvalidCookie) {
      this.processEndFlag = true;
      logger.error(this.getFullTaskName(), e);
    } else {
      this.processEndFlag = true;
      throw e;
    }
  }

  // メイン処理 protected
  async main(){
    // プロセスで以降の処理をスキップさせるか
    this.processEndFlag = false;

    let datas = await this.readyDatas();

    // HACKME 別メソッドに切り出した方がいいかもね
    for (let dataCount = 0; dataCount < datas.length; dataCount++) {
      if(this.processEndFlag){ break; }

      try {
        await this.process(datas[dataCount]);
      } catch(e) {
        await this.processError(e);
      }

      let sleepTime = this.getProcessSleepTime();
      if(sleepTime > 0){ await this._sleep(sleepTime); }
    }

    await this.processAllEnd();
  }

  // エラー時に処理 protected
  async error(e){
    logger.error(this.getFullTaskName(), e);
  }

  // 絶対に処理
  async finally(){}

  // スリープ処理
  _sleep(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
}
