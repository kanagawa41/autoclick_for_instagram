"use strict";

/**
 * 概要: tasks配下のタスクファイルを実行する。
 * 用途: 
 * 引数: 
 * 使用方法: $ node index.js test
 */

// 計測用
const startMs = new Date().getTime();

// ルートパス(後ろにスラッシュ無し)
const path = require('path');
global.ROOT_PATH = path.join(__dirname, '../');

// タスク名の検証
const targetTaskName = process.argv[2];

// 引数(:で分割する)
const args = process.argv[3]!= null ? process.argv[3].split(':') : [];

// アクションのチェック
const TASK_DIR_PATH = path.join(ROOT_PATH, 'lib/tasks');
global.MODEL_PATH = path.join(ROOT_PATH, 'app/models');

// env.js
require('dotenv').config();

// ORMのロード
const Sequelize = require('sequelize');
const sequelize = new Sequelize('inst_clk','','',{dialect: 'sqlite',storage: './db/inst_clk.sqlite3'});

// モデルのロード
require(path.join(MODEL_PATH, 'concerns/relations.js'))(sequelize);

// Utilsのロード
global.MyBrowser = require(path.join(TASK_DIR_PATH, 'concerns/my_browser.js'));
global.PageUtil = require(path.join(TASK_DIR_PATH, 'concerns/page_util.js'));

// ツール群
global.slack = require(path.join(ROOT_PATH, 'lib/slack.js'));
global.logger = require(path.join(ROOT_PATH, 'lib/logger.js'));
global.ERROR = require(path.join(ROOT_PATH, 'lib/errors.js'));

const fs = require('fs');
const taskFiles = fs.readdirSync(TASK_DIR_PATH).filter(function(file){
  // jsファイルのみをターゲット
  return /.+\.js$/.test(file);
});

let targetTask = null;
let cTasks = [];
// タスクをインスタンス化、名前を比較する
for (let i = 0; i < taskFiles.length; i++) {
  const Tasks = require(path.join(TASK_DIR_PATH, taskFiles[i]));

  for (let j = 0; j < Tasks.length; j++) {
    const task = new Tasks[j]();

    if(targetTaskName && targetTaskName == task.getFullTaskName()){
      targetTask = task;
    }

    cTasks.push(task);
  }
}

if(!targetTaskName){ 
  console.log("=タスク一覧=============");
  for (let i = 0; i < cTasks.length; i++) {
    const taskName = cTasks[i].getFullTaskName();
    console.log("- ", taskName);
  }
  console.log("======================");
  return;
}

if(!targetTask){ throw new Error(targetTaskName + " は存在しないタスクです。"); }

(async () => {
  try {
    targetTask.taskArgs = args;
    targetTask.dbConnection = sequelize;

    logger.info(targetTask.getFullTaskName(), "start");

    await targetTask.execute();

    logger.info(targetTask.getFullTaskName(), "finish");

    const elapsedMs = new Date().getTime() - startMs;
    slack.taskInfo(targetTask.getFullTaskName(), 'processing time', Math.floor(((elapsedMs / 1000))) + ' sec');
  } catch(e) {
    const taskName = targetTask ? targetTask.getFullTaskName() : "";

    logger.error(taskName, e);
  }
})();
