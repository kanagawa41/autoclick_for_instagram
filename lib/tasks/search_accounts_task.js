"use strict";

const path = require('path');
const fs = require("fs");
const AbstractTask = require(path.join(__dirname, 'concerns/abstract_task.js'));

const namespace = null;

/**
 * 概要: アクションのサンプルクラス
 */
class SearchAccountTask extends AbstractTask {
  namespace(){
    return namespace;
  }

  // エラー時に処理 protected
  async error(e){
    logger.error(this.getFullTaskName(), e);
  }

  // メイン処理
  async main(){
    const limit = this.args.length == 1 ? this.args[0] : 100;

    let targetAccounts = [];
    await Account.findAll({
      where: [{
        is_collect: true,
      }],
      limit: limit,
      raw: true,
    }).then(results => {
      for(let i = 0; i < results.length; i++){
        const result = results[i];
        console.log({
          id: result['id'],
          username: result['username'],
          postNum: result['postNum'],
          followerNum: result['followerNum'],
          followedNum: result['followedNum'],
          pr: result['pr'],
        });
      }
    });
  }
}

module.exports = [SearchAccountTask];