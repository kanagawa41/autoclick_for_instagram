"use strict";

const path = require('path');
const fs = require("fs");
const AbstractTask = require(path.join(__dirname, 'concerns/abstract_task.js'));

const namespace = "init";

/**
 * 概要: 初期設定
 */
class DefaultTask extends AbstractTask {
  namespace(){
    return namespace;
  }

  // 前処理
  async before(){
    if(this.args.length < 2){
      throw new ERROR.InvalidArgs('引数に、"ユーザ名"、"パスワード"を設定してください。');
    }
  }

  // メイン処理
  async main(){
    await this.init();
    await this.seed();
  }

  async seed(){
    // let cookie = fs.readFileSync(ROOT_PATH + '/tmp/cookies/1.json', 'utf-8');
    await User.create({
      username: this.args[0],
      password: this.args[1],
      isActive: true,
      maxClickCount: 10,
      cookieJson: "",
      isValidCookie: false,
      tags: "jp,instagram,love",
    });
  }

  async init(){
    await this.sequelize
      .sync({force: true, alter: false})
      .then(() =>{
        console.log("Create DB.");
      }).catch((error) =>{
        console.log("[ERROR]" + error);
      });
  }
}

/**
 * 概要: アクションの設定
 */
class ActionTask extends AbstractTask {
  namespace(){
    return namespace;
  }

  async main(){
    await Action.destroy({
      truncate: true /* this will ignore where and truncate the table instead */
    });

    // FIXME: 継承して他でも使えるようにしたい
    await this.sequelize.query("update sqlite_sequence set seq = -1 where name = :tablename", { replacements: { tablename: Action.getTableName() } }).spread((results, metadata) => {
      console.log(results);
    })

    let data = [{
      actionName: "login",
      note: "ログイン",
    },{
      actionName: "fetch_url:tag_stream",
      note: "タグよりURLを抽出",
    },{
      actionName: "click_like",
      note: "写真ページでいいねする",
    },{
      actionName: "fetch_url:account_stream",
      note: "アカウントのストリームからURLを抽出",
    }];
    await Action.bulkCreate(data, {ignoreDuplicates: true});
  }
}

module.exports = [DefaultTask, ActionTask];