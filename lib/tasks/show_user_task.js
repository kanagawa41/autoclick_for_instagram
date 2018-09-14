"use strict";

const path = require('path');
const AbstractTask = require(path.join(__dirname, 'concerns/abstract_task.js'));
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const namespace = null;

/**
 * 概要: ユーザ情報を表示する
 */
class ShowUserTask extends AbstractTask {
  namespace(){
    return namespace;
  }

  // 前処理
  async before(){}

  // メイン処理
  async main(){
    if(this.args.length == 0){ throw new Error('対象ユーザを指定するIDが必要です。'); }

    let userInfo = {};

    await User.findById(this.args[0]).then(result => {
      userInfo['id'] = result.id;
      userInfo['username'] = result.username;
      userInfo['is_active'] = result.isActive;
      userInfo['max_click_count'] = result.maxClickCount;
      userInfo['tags'] = result.tags;
    });

    userInfo['click_count_in_day'] = 0;
    // クリック履歴を返却する
    await ClickHistory.findAll({
      where: {
        createdAt: {
          // 24時間以内
          [Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000),
        }
      }
    }).then(results => {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        userInfo['click_count_in_day'] += result.clickCount;
      }
    }).catch(error => {
      console.log("[ERROR]" + error);
    });

    slack.taskInfo(this.getFullTaskName(), userInfo, "");
    logger.info(userInfo);
  }

  // 後処理
  async after(){}

  // 絶対に処理
  async finally(){
  }
}

module.exports = [ShowUserTask];