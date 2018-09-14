
/**
 * 概要: tasks配下の「xxx_task.js」をAPI化する
 * 用途: 
 * 引数: 
 * 使用方法: $ node lib/api_app.js
 */

/* 1. expressモジュールをロードし、インスタンス化してappに代入。*/
const express = require("express");
const app = express();

const path = require('path');
const ROOT_PATH = path.join(__dirname, '../');

app.engine('pug', require('pug').__express)
app.set('views', path.join(ROOT_PATH, 'app/views'));
app.set('view engine', 'pug');

// env.js
require('dotenv').config();

/* 3. 以後、アプリケーション固有の処理 */

// ORMのロード
const Sequelize = require('sequelize');
global.sequelize = new Sequelize('inst_clk','','',{dialect:'sqlite',storage:'./db/inst_clk.sqlite3'});

const TASK_DIR_PATH = path.join(ROOT_PATH, 'lib/tasks');

const fs = require('fs');
const taskFiles = fs.readdirSync(TASK_DIR_PATH).filter(function(file){
  // jsファイルのみをターゲット
  return /.+\.js$/.test(file);
});

let cTasks = [];
// タスクをインスタンス化、名前を比較する
for (let i = 0; i < taskFiles.length; i++) {
  const Tasks = require(path.join(TASK_DIR_PATH, taskFiles[i]));

  for (let j = 0; j < Tasks.length; j++) {
    const task = new Tasks[j]();

    cTasks.push(task);
  }
}

if(cTasks.length == 0){ throw new Error("タスクが存在しません。"); }

const exec = require('child_process').exec;
// slack通知用
const slack = require(path.join(ROOT_PATH, 'lib/slack.js'));
require('date-utils');

const TASK_LOG_PATH = path.join(ROOT_PATH, 'tmp/task_logs');

console.log("対象タスク");

// ネームの区切り文字
const DELIMITER = ":";

function toUrl(taskName){
  return taskName.replace(new RegExp(DELIMITER), '/');
}
function toFile(taskName){
  return taskName.replace(new RegExp(DELIMITER), '_');
}

// FIXME: 共通化する
console.log("-","/api/tasks");
app.get("/api/tasks", function(req, res, next){
  let command = 'npm run task';

  const logFilename = 'tasks_' + new Date().toFormat("YYMMDDHH24MISS");

  slack.taskInfoWithLog("tasks", logFilename);

  const logPath = path.join(TASK_LOG_PATH, logFilename);

  function processLog(data){
    fs.appendFile(logPath, data, function (err) { if (err) { throw err; } });
  }

  // 制御文字を取り除く
  function removeControlCharacter(str){
    if(!str){ return; }
    return str.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]\[(9\d|3\d|0)m/g, '')
  }

  const childProcess = exec(command, (err, stdout, stderr) => {
    if(err){
      processLog(removeControlCharacter(err.message));
    }
    // if(stderr){
    //   processLog(removeControlCharacter(stderr.message));
    // }
    processLog(removeControlCharacter(stdout));
  });

  res.json({
    pid: childProcess.pid,
  });
});

// TaskをAPIとして登録する
for (let i = 0; i < cTasks.length; i++) {
  // FIXME: task_namespaceの定数を使用する
  const taskName = cTasks[i].getFullTaskName();

  console.log("-","/api/tasks/" + toUrl(taskName));

  app.get("/api/tasks/" + toUrl(taskName), function(req, res, next){
    let command = 'npm run task ' + taskName;
    // 引数が指定されていれば付与
    command = req.query.args ? command + ' ' + req.query.args : command;

    const logFilename = toFile(taskName) + '_' + new Date().toFormat("YYMMDDHH24MISS");

    slack.taskInfoWithLog(taskName, logFilename);

    const logPath = path.join(TASK_LOG_PATH, logFilename);

    function processLog(data){
      fs.appendFile(logPath, data, function (err) { if (err) { throw err; } });
    }

    // 制御文字を取り除く
    function removeControlCharacter(str){
      if(!str){ return; }
      return str.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]\[(9\d|3\d|0)m/g, '')
    }

    const childProcess = exec(command, (err, stdout, stderr) => {
      if(err){
        processLog(removeControlCharacter(err.message));
      }
      if(stderr){
        processLog(removeControlCharacter(stderr.message));
      }
      processLog(removeControlCharacter(stdout));
    });

    res.json({
      pid: childProcess.pid,
      task: taskName,
      args: req.query.args,
    });
  });
}
// ログを返却する
// app.use('/logs', express.static(TASK_LOG_PATH));
app.get('/logs/:log_id', function(req, res, next){
  const logPath = path.join(TASK_LOG_PATH, req.params.log_id);

  let text = null;
  try{
    text = fs.readFileSync(logPath, 'utf-8');
  }catch(e){
    res.render('logs/index', { title: 'ログコンソール', message: "まだログが出力されていません!"});
    return;
  }
  text = text.replace(/\r?\n/g , "<br>");

  res.render('logs/index', { title: 'ログコンソール', message: text});
});

const CAPTURE_PATH = path.join(ROOT_PATH, 'tmp/captures');
// 画像を返却する
app.use('/images', express.static(CAPTURE_PATH));

// FIXME: 使用するか要件等
// app.get("/api/pids/:pid", function(req, res, next){
//   let command = 'ps -p ' + req.params.pid;

//   const childProcess = exec(command, (err, stdout, stderr) => {
//     if(err){
//       console.log(err);
//     }

//     res.json({
//       stdout: stdout,
//     });
//   });
// });

// 404エラー
app.use(function(req, res, next) {
  res.status(404).json({
    message: 'Sorry cant find that!'
  });
});

// 500エラー
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something broke!'
  });
});

/* 2. listen()メソッドを実行して5000番ポートで待ち受け。*/
const server = app.listen(process.env.APP_PORT, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});