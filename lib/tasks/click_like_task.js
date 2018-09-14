"use strict";

const path = require('path');
const UserProcedureTask = require(path.join(__dirname, 'concerns/user_procedure_task.js'));

const namespace = null;

/**
 * 概要: 指定のページのライクをクリックする
 */
class ClickLikeTask extends UserProcedureTask {
  namespace(){
    return namespace;
  }

  // HACK: 複数人をループできるようにする
  async readyUsers(){
    let users = [];
    await User.findById(1).then(result => {
      users.push(result);
    });

    return users;
  }

  // 一要素に対して処理を行う protected
  async readyDatas(){
    // 更新用
    this.userPartialPhotoIds = [];
    // アカウント収集用
    this.targetUsernames = [];
    // クリック数
    this.clickCount = 0;

    // ログインしていない
    if(!await this.validLogin()){
      return [];
    }

    let urls = [];
    await PartialPhotoId.findAll({
      where: [{
        user_id: this.user.id
      },{
        is_click_done: false
      }],
      limit: this.user.maxClickCount, // FIXME: 一度の上限数をどうするか再検討
    }).then(results => {
      urls = results;
    });

    return urls;
  }

  // ログインチェック
  async validLogin(){
    const isGoodCookie = await PageUtil.setCookie(this.page, this.user.cookieJson);

    if(!isGoodCookie){
      this.processEndFlag = true;
      await this.user.updateCookieBadly();

      throw new ERROR.InvalidCookie("クッキーが有効ではありません。");
    }

    const response = await PageUtil.goto(this.page, PageUtil.makeProfileUrl(this.user.username));
    if(!response.ok()){
      throw new ERROR.NotFoundPage('自分のプロフィール画面が開けません。');
    }

    const isLogin = await PageUtil.isLogined(this.page, this.user);
    // ログインチェック
    if(!isLogin){
      logger.warn(this.getFullTaskName(), this.user.username, "isn't logined yet.");
      this.processEndFlag = true;
      await this.user.updateCookieBadly();

      throw new ERROR.Unexpected('ログインを試みましたが、自分のプロフィール画面が開けません。');
    }

    return true;
  }

  // タグページの画像URLを取得する
  async process(partialPhotoId){
    this.userPartialPhotoIds.push(partialPhotoId.id);

    let targetUrl = PageUtil.makePhotoUrl(partialPhotoId.photoId, partialPhotoId.query);
    console.log("click page: " + targetUrl);

    let response = await PageUtil.goto(this.page, targetUrl);
    if(!response.ok()){
      logger.warn(this.getFullTaskName(), '写真ページが開けません: ' + targetUrl);
      return;
    }

    // 動作確認用
    // console.log("HTML: " + await PageUtil.getBodyHtml(this.page));

    try {
      const clickSuccess = await this.clickLike();
      if(clickSuccess){ this.clickCount++; }
    } catch(e) {
      throw new ERROR.NotFoundElement(e.message);
    }

    const username = await this.page.evaluate(() => {
      const usernameElement = document.querySelector('#react-root > section > main > div > div > article > header > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > a');
      return usernameElement ? usernameElement.getAttribute('href').replace(/\//g, '') : null;
    });
    if(username){
      this.targetUsernames.push(username);
    }else{
      logger.warn(this.getFullTaskName(), 'ユーザ名が取得できません: ' + targetUrl);
    }
  }

  // いいねをクリックする
  async clickLike(){
    return await this.page.evaluate(() => {
      // 1st
      // let likeElement = document.querySelector('#react-root > section > main > div > div > article > div:nth-child(3) > section:nth-child(1) > a:nth-child(1) > span');
      // 2nd
      let likeElement = document.querySelector('#react-root > section > main > div > div > article > div:nth-child(3) > section:nth-child(1) > span:nth-child(1) > button > span');
      // 要素が存在しない
      if(likeElement == null){ throw new Error('いいねボタンがない'); }

      // 既に「いいね」されている
      // 1st
      // const clickedClass = "coreSpriteHeartFull";
      // 2nd
      const regExp = "^glyphsSpriteHeart__filled.+"; // 反対は、glyphsSpriteHeart__outlinea

      if(likeElement.classList[0].match(regExp)){ return false; }

      likeElement.click();

      // クリックしたはずが「いいね」していない
      if(!likeElement.classList[0].match(regExp)){ throw new Error('いいねをクリックできていない。'); }

      return true;
    });
  }

  // 後処理
  async processAllEnd(){
    const imagePath = await PageUtil.capture(this.page, this.getFullTaskNameForFile());
    slack.taskInfoWithImg(this.getFullTaskName(), "capture", imagePath);

    if(this.userPartialPhotoIds.length <= 0){ return; }

    await PartialPhotoId.update({
      isClickDone: true,
    },{
      where: {
        id: this.userPartialPhotoIds,
      },
    });

    await ClickHistory.create({
      userId: this.user.id,
      actionId: this.actionId,
      clickCount: this.clickCount,
    });

    let accounts = [];
    for (let i = 0; i < this.targetUsernames.length; i++) {
      const targetUsername = this.targetUsernames[i];
      accounts.push({
        username: targetUsername,
      });
    }

    await Account.bulkCreate(accounts, {ignoreDuplicates: true});
  }

  // 各プロセス毎のスリープ時間 protected
  getProcessSleepTime(){
    // FIXME 値をランダムにする
    return 5000;
  }
}

module.exports = [ClickLikeTask];