"use strict";

const fs = require("fs");
const path = require('path');
const AbstractTask = require(path.join(__dirname, 'concerns/abstract_task.js'));

const namespace = null;

/**
 * 概要: アクションのサンプルクラス
 */
class SampleTask extends AbstractTask {
  namespace(){
    return namespace;
  }

  // 前処理
  async before(){
    this.myBrowser = new MyBrowser();

    this.page = await this.myBrowser.newPage();
  }

  // エラー時に処理 protected
  async error(e){
    logger.error(this.getFullTaskName(), e);
  }

  // メイン処理
  async main(){
    console.log(this.args);

    let response = await PageUtil.goto(this.page, 'https://www.instagram.com/p/Bi1XrB3he6k/?tagged=instagram');

    if(!response.ok()){
      throw new ERROR.NotFoundPage('サンプル画面が開けません。');
    }
  }

  // 後処理
  async after(){
    const imagePath = await PageUtil.capture(this.page, this.getFullTaskNameForFile());
    slack.taskInfoWithImg(this.getFullTaskName(), "capture", imagePath);
  }

  // 絶対に処理
  async finally(){
    this.myBrowser.close();
  }
}

module.exports = [SampleTask];