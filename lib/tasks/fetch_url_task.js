"use strict";

const path = require('path');
const UserProcedureTask = require(path.join(__dirname, 'concerns/user_procedure_task.js'));
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const namespace = "fetch_url";

class StreamBaseTask extends UserProcedureTask {
  // HACK: 複数人をループできるようにする
  async readyUsers(){
    let users = [];
    await User.findById(1).then(result => {
      users.push(result);
    });

    return users;
  }

  // ストリームから写真のURLをすべて取得
  async fetchUrls(){
    return await this.page.evaluate(() => {
      let urls = [];
      document.querySelectorAll('a').forEach(
        function(element, index, array) {
          let href = element.getAttribute('href');
          // URL用
          if(href.match(/\/p\/.+?\//)){
            urls.push(href); 
          }
        }
      );
      return urls;
    });
  }

  // 更新用のハッシュを作成
  createInsertHash(imageUrl){
    let rawUrl = imageUrl.split('?');
    let domain = rawUrl[0];
    let query = rawUrl[1];

    return {
      userId: this.user.id,
      photoId: domain.match(/\/p\/(.+?)\//)[1],
      isClickDone: false,
      actionId: this.actionId,
      query: query,
    };
  }

  // 後処理
  async processAllEnd(){
    const imagePath = await PageUtil.capture(this.page, this.getFullTaskNameForFile());
    slack.taskInfoWithImg(this.getFullTaskName(), "capture", imagePath);
  }
}

/**
 * 概要: タグストリームでURLを採集する
 */
class TagStreamTask extends StreamBaseTask {
  namespace(){
    return namespace;
  }

  async readyDatas(){
    let tags = this.user.tags.split(',');

    return tags;
  }

  // タグページの画像URLを取得する
  async process(tag){
    let targetUrl = PageUtil.makeTagUrl(tag);

    let response = await PageUtil.goto(this.page, targetUrl);

    if(!response.ok()){
      throw new ERROR.NotFoundPage('タグページが開けません。');
    }

    await PageUtil.autoScroll(this.page, 5);
    await this.page.waitFor(1000);

    let imageUrls = await this.fetchUrls();

    let partialPhotoDatas = [];
    for (let i = 0; i < imageUrls.length; i++) {
      partialPhotoDatas.push(this.createInsertHash(imageUrls[i]));
    }

    PartialPhotoId.bulkCreate(partialPhotoDatas, {ignoreDuplicates: true});

    // console.log(imageUrls);
  }
}

/**
 * 概要: ユーザストリームからURLを採集する
 */
class AccountStreamTask extends StreamBaseTask {
  namespace(){
    return namespace;
  }

  //一度に収集する人数
  get FIND_ACCOUNT_NUM_AT_ONCE(){ return 10; }

  //一人当たりの収集する枚数
  get FETCH_NUM_PER_ONE(){ return 5; }

  async readyDatas(){
    let targetAccounts = [];
    // FIXME: ランダムではなく、厳密に選定を行う
    await Account.findAll({
      where: [{
        is_collect: {
          [Op.eq]: true
        }
      }],
      order: this.sequelize.literal('RANDOM()'),
      limit: this.FIND_ACCOUNT_NUM_AT_ONCE,
    }).then(results => {
      targetAccounts = results;
    });

    return targetAccounts;
  }

  // タグページの画像URLを取得する
  async process(account){
    console.log(account.username);
    let targetUrl = PageUtil.makeProfileUrl(account.username);

    let response = await PageUtil.goto(this.page, targetUrl);
    if(!response.ok()){
      account.isCollect = false;
      await account.save();

      throw new ERROR.NotFoundPage('プロフィールページが開けません。: ' + account.username + "(" + account.id + ")");
    }

    let imageUrls = await this.fetchUrls();
    imageUrls = imageUrls.slice(0, this.FETCH_NUM_PER_ONE);

    let partialPhotoDatas = [];
    for (let i = 0; i < imageUrls.length; i++) {
      partialPhotoDatas.push(this.createInsertHash(imageUrls[i]));
    }

    PartialPhotoId.bulkCreate(partialPhotoDatas, {ignoreDuplicates: true});

    // console.log(imageUrls);
  }
}

module.exports = [TagStreamTask, AccountStreamTask];