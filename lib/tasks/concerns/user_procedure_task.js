"use strict";

const path = require('path');
const AbstractTask = require(path.join(__dirname, 'abstract_task.js'));

/**
 * 概要: アクションの抽象クラス
 */
module.exports = class UserProcedureTask extends AbstractTask {
  // 各プロセス毎のスリープ時間 protected
  getProcessSleepTime(){
    return 0;
  }

  // 対象ユーザを返却する。 protected
  async readyUsers(){
    throw new Error("Need to extends readyUsers.");
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
    // ブラウザ起動
    this.myBrowser = new MyBrowser();
    this.page = await this.myBrowser.newPage();

    this.actionId = null;
    await Action.findOne({
      where: [{
        action_name: this.getFullTaskName()
      },]
    }).then(result => {
      if(result == null){
        throw new ERROR.NotFoundAction(this.getFullTaskName() + " はアクションとして登録されていません。.");
      }

      this.actionId = result.id;
    });

    let users = await this.readyUsers();

    for (let userCount = 0; userCount < users.length; userCount++) {
      this.user = users[userCount];

      logger.info(this.getFullTaskName(), "Target user is", this.user.username);

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

      // アクションの記録
      ActionHistory.create({
        userId: this.user.id,
        actionId: this.actionId,
        isSuccess: !this.processEndFlag,
      });
    }
  }

  // エラー時に処理 protected
  async error(e){
    logger.error(this.getFullTaskName(), e);
  }

  // 絶対に処理
  async finally(){
    this.myBrowser.close();
  }

  // スリープ処理
  _sleep(time) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }
}
