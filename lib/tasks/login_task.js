"use strict";

const path = require('path');
const UserProcedureTask = require(path.join(__dirname, 'concerns/user_procedure_task.js'));

const namespace = null;

/**
 * 概要: ログインタスク
 */
class LoginTask extends UserProcedureTask {
  namespace(){
    return namespace;
  }

  // HACK: 複数人をループできるようにする
  async readyUsers(){
    let users = [];
    await User.findById(1).then(result => {
      users.push(result);
    });

    return users;
  }

  // 一要素に対して処理を行う protected
  async readyDatas(){
    // ダミーデータ
    return [true];
  }

  // ログインを行う
  async process(data){
    let response = await PageUtil.goto(this.page, PageUtil.makeProfileUrl(this.user.username));

    if(!response.ok()){
      throw new ERROR.NotFoundPage('自分のプロフィール画面が開けません。');
    }

    if(await PageUtil.isLogined(this.page, this.user)){
      const message = this.user.username + " is already logined.";
      logger.info(this.getFullTaskName(), this.user.username, "is already logined.");
      return;
    }

    response = await PageUtil.goto(this.page, 'https://www.instagram.com/accounts/login/');

    if(!response.ok()){
      throw new ERROR.NotFoundPage('ログイン画面が開けません。');
    }

    await this.page.waitFor(5000);

    // ログイン情報の入力
    await this.page.type('input[maxlength="75"]', this.user.username);
    await this.page.type('input[name="password"]', this.user.password);

    // 送信ボタン押下
    await this.page.evaluate(() => document.querySelector("button").removeAttribute('disabled'));
    await this.page.evaluate(() => document.querySelector("button").click());

    await this.page.waitFor(2000);

    if(! await PageUtil.isLogined(this.page, this.user)){
      throw new ERROR.Unexpected(this.user.username + "はログインできません。");
    }

    const cookie = await this.page.cookies();
    await this.user.updateCookieWell(JSON.stringify(cookie));

    await PageUtil.capture(this.page, this.getFullTaskName() + '_after');
  }

  // 後処理
  async processAllEnd(){
    const imagePath = await PageUtil.capture(this.page, this.getFullTaskNameForFile());
    slack.taskInfoWithImg(this.getFullTaskName(), "capture", imagePath);
  }

  // 各プロセス毎のスリープ時間 protected
  getProcessSleepTime(){
    return 5000;
  }
}

module.exports = [LoginTask];