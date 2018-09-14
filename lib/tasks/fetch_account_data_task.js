"use strict";

const path = require('path');
const ProcedureTask = require(path.join(__dirname, 'concerns/procedure_task.js'));

const namespace = null;

/**
 * 概要: タグストリームでURLを採集する
 */
class FetchAccountDataTask extends ProcedureTask {
  namespace(){
    return namespace;
  }

  //一度に収集する人数
  get FIND_USER_NUM_AT_ONCE(){ return 30; }

  async before(){
    // ブラウザ起動
    this.myBrowser = new MyBrowser();
    this.page = await this.myBrowser.newPage();
  }

  // 一要素に対して処理を行う protected
  async readyDatas(){
    let targetAccounts = [];
    await Account.findAll({
      where: [{
        is_collect: null,
      }],
      limit: this.FIND_USER_NUM_AT_ONCE,
    }).then(results => {
      targetAccounts = results;
    });

    return targetAccounts;
  }

  // タグページの画像URLを取得する
  async process(account){
    let targetUrl = PageUtil.makeProfileUrl(account.username);

    let response = await PageUtil.goto(this.page, targetUrl);
    if(!response.ok()){
      account.isCollect = false;
      await account.save();

      throw new ERROR.NotFoundPage('プロフィールページが開けません。: ' + account.username + "(" + account.id + ")");
    }

    const accountData = await this._fetchAccountData();

    let unsetKyes = [];
    Object.keys(accountData).forEach(function (key) {
      if(!accountData[key]){
        unsetKyes.push(key);
      }
    });

    if(unsetKyes.length != 0){
      throw new ERROR.NotFoundElement(unsetKyes.join(',') + 'のユーザ情報が取得できませんでした。: ' + account.username + "(" + account.id + ")");
    }

    account.postNum = accountData['post_num'];
    account.followerNum = accountData['follower_num'];
    account.followedNum = accountData['followed_num'];
    account.pr = accountData['pr'];
    account.isActive = true;
    await account.save();
  }

  // アカウントの情報を取得する
  async _fetchAccountData(){
    return await this.page.evaluate(() => {
      let accountData = {};

      const root_attr = '#react-root > section > main > div > header > section';
      // username
      // accountData['username'] = document.querySelector(root_attr + ' > div:nth-child(1) > h1').textContent;

      // フォロー状態
      // document.querySelector('#react-root > section > main > div > header > section > div:nth-child(1) > span > span:nth-child(1) > button')

      // ポスト数
      accountData['post_num'] = document.querySelector(root_attr + ' > ul > li:nth-child(1) > span > span').textContent.replace(/,/g, '');

      // フォロワー数（title）
      followerNum = document.querySelector(root_attr + ' > ul > li:nth-child(2) > a > span');
      if(followerNum){
        accountData['follower_num'] = followerNum.getAttribute('title') ? followerNum.getAttribute('title').replace(/,/g, '') : followerNum.textContent.replace(/,/g, '');
      }else{
        accountData['follower_num'] = null;
      }

      // フォロー数
      followedNum = document.querySelector(root_attr + ' > ul > li:nth-child(3) > a > span');
      if(followedNum){
        accountData['followed_num'] = followedNum.getAttribute('title') ? followedNum.getAttribute('title').replace(/,/g, '') : followedNum.textContent.replace(/,/g, '');
      }else{
        accountData['followed_num'] = null;
      }

      // PR
      accountData['pr'] = document.querySelector(root_attr + ' > div:nth-child(3)').textContent;

      return accountData;
    });
  }

  // 後処理
  async processAllEnd(){
    const imagePath = await PageUtil.capture(this.page, this.getFullTaskNameForFile());
    slack.taskInfoWithImg(this.getFullTaskName(), "capture", imagePath);
  }

  // エラー処理 protected
  async processError(e){
    // プロフィールページが開けないと処理が中断するため
    this.processEndFlag = false;
    logger.error(this.getFullTaskName(), e);
  }

  // 絶対に処理
  async finally(){
    this.myBrowser.close();
  }
}

module.exports = [FetchAccountDataTask];