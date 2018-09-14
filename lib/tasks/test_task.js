"use strict";

const path = require('path');
const AbstractTask = require(path.join(__dirname, 'concerns/abstract_task.js'));

const namespace = null;

/**
 * 概要: アクションのサンプルクラス
 */
class TestTask extends AbstractTask {
  namespace(){
    return namespace;
  }

  // 前処理
  async before(){
    this.myBrowser = new MyBrowser();
    
    this.page = await this.myBrowser.newPage();
  }

  // メイン処理
  async main(){
    await this._test8();
    // await this._test7();
    // await this._test6();
    // await this._test5();
    // await this._test4();
    // await this._test3();
    // await this._test2();
    // await this._test1();
  }

  async _test8(){
    // 表示される
    try {
        throw new ERROR.NotFoundPage('プロフィールページが開けません。');
    } catch(e) {
        if (e instanceof ERROR.NotFoundPage) {
            console.log(e.name);
            console.log(e.message);
        }
    }
    // 表示されない
    try {
        throw new Error('プロフィールページが開けません。');
    } catch(e) {
        if (e instanceof ERROR.NotFoundPage) {
            console.log(e.name);
            console.log(e.message);
        }
    }
  }

  async _test7(){
    let response = await PageUtil.goto(this.page, 'https://www.instagram.com/p/Bkd5QdIDhuM/?taken-by=thecabinchronicles');
    await this.page.waitFor(2000);

    const username = await this.page.evaluate(() => {
      return document.querySelector('#react-root > section > main > div > div > article > header > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a').getAttribute('href').replace(/\//g, '');
    });

    await Account.create({
      username: username,
    });

    console.log(username);
  }

  async _test6(){
    let response = await PageUtil.goto(this.page, 'https://www.instagram.com/thecabinchronicles/');
    await this.page.waitFor(2000);

    const imagePath = await PageUtil.capture(this.page, this.getFullTaskNameForFile());
    slack.taskInfoWithImg(this.getFullTaskName(), "capture", imagePath);

    // console.log(await PageUtil.getBodyHtml(this.page));

    const accountData = await this.page.evaluate(() => {
      let accountData = {};

      const root_attr = '#react-root > section > main > div > header > section';
      // username
      accountData['username'] = document.querySelector(root_attr + ' > div:nth-child(1) > h1').textContent;

      // フォロー状態
      // document.querySelector('#react-root > section > main > div > header > section > div:nth-child(1) > span > span:nth-child(1) > button')

      // ポスト数
      accountData['post_num'] = document.querySelector(root_attr + ' > ul > li:nth-child(1) > span > span').textContent.replace(/,/g, '');

      // フォロワー数（title）
      followerNum = document.querySelector(root_attr + ' > ul > li:nth-child(2) > span > span');
      if(followerNum){
        accountData['follower_num'] = followerNum.getAttribute('title') ? followerNum.getAttribute('title').replace(/,/g, '') : followerNum.textContent.replace(/,/g, '');
      }else{
        accountData['follower_num'] = null;
      }

      // フォロー数
      accountData['followed_num'] = document.querySelector(root_attr + ' > ul > li:nth-child(3) > span > span').textContent.replace(/,/g, '');

      // PR
      accountData['pr'] = document.querySelector(root_attr + ' > div:nth-child(3)').textContent;

      return accountData;
    });

    console.log(accountData);
  }

  async _test5(){
    const fs = require('fs');
    const path = require('path');

    /**
     * 指定フォルダ内のファイル数がリミットを越えていた場合、日付降順で余分なファイルを削除する
     */
    function deleteExtraFile(dirPath, limit=100){
      const files = fs.readdirSync(dirPath).filter(function(file){
        // .XXX は除外
        return !/^\..+$/.test(file);
      });

      let fileCreatedAts = [];
      // fileの生成時間を抽出
      for (let i = 0; i < files.length; i++) {
        const filename = files[i];

        const fileStat = fs.statSync(path.join(dirPath, filename));
        const filedata = {};
        filedata['filename'] = filename;
        filedata['birthtimeMs'] = fileStat['birthtimeMs'];
        fileCreatedAts.push(filedata);
      }

      // 日付を降順でソート
      fileCreatedAts.sort(function(a, b) {
        return b['birthtimeMs'] - a['birthtimeMs'];
      });

      const deleteFiles = fileCreatedAts.slice(limit);
      // 余分なファイルを削除
      for (let i = 0; i < deleteFiles.length; i++) {
        const deleteFile = deleteFiles[i];
        fs.unlink(path.join(dirPath, deleteFile['filename']), function (err) {});
      }
    }

    const TASK_LOG_PATH = path.join(ROOT_PATH, 'tmp/task_logs');
    deleteExtraFile(TASK_LOG_PATH, 100);
  }

  async _test4(){
    const exec = require('child_process').exec;
    exec('ls -la ./', (err, stdout, stderr) => {
      if (err) { console.log(err); }
      console.log(stdout);
    });
  }

  async _test3(){
    slack.taskInfo(this.getFullTaskName(), "test", "This is test push of info.");
    slack.taskError(this.getFullTaskName(), "test", "This is test push of error.");
  }

  async _test2(){
    let tag = "jp";
    let targetUrl = "https://www.instagram.com/explore/tags/" + tag + "/";

    await PageUtil.goto(this.page, targetUrl);

    let result = await PageUtil.isLogined(this.page);
    console.log('login状態' + result);
  }

  async _test1(){
    let tag = "jp";
    let targetUrl = "https://www.instagram.com/explore/tags/" + tag + "/";

    await PageUtil.goto(this.page, targetUrl);

    await PageUtil.capture(this.page, TestTask.getFullTaskName());
  }

  // 後処理
  async after(){
    console.log('Finish');
  }

  // 絶対に処理
  async finally(){
    this.myBrowser.close();
  }
}

module.exports = [TestTask];