"use strict";

const path = require('path');
const fs = require('fs');
const ProcedureTask = require(path.join(__dirname, 'concerns/procedure_task.js'));

const namespace = null;

/**
 * 概要: ファイル数を一定に保つタスク
 */
class DeleteExtraFileTask extends ProcedureTask {
  namespace(){
    return namespace;
  }

  get LIMIT(){ return 100; }

  // 一要素に対して処理を行う protected
  async readyDatas(){
    return [
      path.join(ROOT_PATH, 'tmp/captures'),
      path.join(ROOT_PATH, 'tmp/task_logs'),
    ];
  }

  // ログインを行う
  async process(path){
    this._deleteExtraFile(path, this.LIMIT);
  }

  /**
   * 指定フォルダ内のファイル数がリミットを越えていた場合、日付降順で余分なファイルを削除する
   */
  _deleteExtraFile(dirPath, limit=100){
    const files = fs.readdirSync(dirPath).filter(function(file){
      // .XXX は除外
      return !/^\..+$/.test(file);
    });

    let fileCreatedAts = [];
    // fileの生成時間を抽出
    for (let i = 0; i < files.length; i++) {
      const filename = files[i];

      const fileStat = fs.statSync(path.join(dirPath, filename));

      const filedata = {
        filename: filename,
        birthtimeMs: fileStat['birthtimeMs'],
      };
      fileCreatedAts.push(filedata);
    }

    // 日付を降順でソート
    fileCreatedAts.sort(function(a, b) {
      return b['birthtimeMs'] - a['birthtimeMs'];
    });

    const deleteFiles = fileCreatedAts.slice(limit);
    logger.info(this.getFullTaskName(), '削除ファイル数', deleteFiles.length);

    // 余分なファイルを削除
    for (let i = 0; i < deleteFiles.length; i++) {
      const deleteFile = deleteFiles[i];
      fs.unlink(path.join(dirPath, deleteFile['filename']), function (err) {});
    }
  }

  // 後処理
  async processAllEnd(){}

  // エラー処理 protected
  async processError(e){
    logger.error(this.getFullTaskName(), e);
  }
}

module.exports = [DeleteExtraFileTask];