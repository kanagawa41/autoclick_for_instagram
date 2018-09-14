"use strict";

const path = require('path');
const AbstractTask = require(path.join(__dirname, 'concerns/abstract_task.js'));
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const namespace = null;

/**
 * 概要: ユーザ情報を表示する
 */
class UpdateUserTask extends AbstractTask {
  namespace(){
    return namespace;
  }

  // 前処理
  async before(){}

  // メイン処理
  async main(){
    if(this.args.length < 3){
      throw new ERROR.InvalidArgs('対象ユーザを指定する「ID、一度のクリック回数、タグ(カンマ区切り)」が必要です。');
    }

    let user = null;

    await User.findById(this.args[0]).then(result => {
      user = result;
    });

    user.maxClickCount = this.args[1];
    user.tags = this.args[2];
    user.save();
  }

  // 後処理
  async after(){}

  // 絶対に処理
  async finally(){
  }
}

module.exports = [UpdateUserTask];