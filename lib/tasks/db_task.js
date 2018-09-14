"use strict";

const path = require('path');
const fs = require("fs");
const AbstractTask = require(path.join(__dirname, 'concerns/abstract_task.js'));

const namespace = null;

/**
 * 概要: アクションのサンプルクラス
 */
class DbTask extends AbstractTask {
  namespace(){
    return namespace;
  }

  // 前処理
  async before(){}

  // メイン処理
  async main(){
    // await this.init();
    // await this.seed();
    await this.bulk();
    // await this.test3();
    // await this.test2();
    // await this.test1();
  }

  async seed(){
    // let cookie = fs.readFileSync(ROOT_PATH + '/tmp/cookies/1.json', 'utf-8');
    await User.create({
      username: "",
      password: "",
      isActive: true,
      maxClickCount: 100,
      // cookieJson: cookie,
      cookieJson: "",
      isValidCookie: true,
      tags: "jp,instagram,love",
    });

    let data = [{
      actionName: "login",
      note: "ログイン",
    },{
      actionName: "fetch_url_using_tag",
      note: "タグよりURLを抽出",
    },{
      actionName: "click_like",
      note: "写真ページでいいねする",
    }];
    await Action.bulkCreate(data, {ignoreDuplicates: true});
  }

  async bulk(){
    let imageUrls = [ '/p/Bjg8KExnFDY/?tagged=love',
      '/p/Bjg7Ur5Hp1S/?tagged=love',
      '/p/Bjg9n03gbOh/?tagged=love',
      '/p/Bjg66SIgtdz/?tagged=love',
      '/p/BjgMcx8HTdM/?tagged=love',
      '/p/BjgSLF9hBVS/?tagged=love',
      '/p/Bjg8rZ_gz8G/?tagged=love',
      '/p/Bjg7hgdFJix/?tagged=love',
      '/p/Bjg8acHA1jo/?tagged=love',
      '/p/Bjg_vq8HZ8-/?tagged=love',
      '/p/Bjg_vtmF5Ru/?tagged=love',
      '/p/Bjg_vumnPXy/?tagged=love',
      '/p/Bjg_vm6hu7m/?tagged=love',
      '/p/Bjg_vlfALR3/?tagged=love',
      '/p/Bjg_vibAKIe/?tagged=love',
      '/p/Bjg_voABCRu/?tagged=love',
      '/p/Bjg_vhSBPlY/?tagged=love',
      '/p/Bjg_vgagnUi/?tagged=love',
      '/p/Bjg_vhCDX0y/?tagged=love',
      '/p/Bjg_vbvHE4l/?tagged=love',
      '/p/Bjg_vfEnrpc/?tagged=love' ];

    let partialPhotoDatas = [];
    for (let i = 0; i < imageUrls.length; i++) {
      let rawUrl = imageUrls[i].split('?');
      let domain = rawUrl[0];
      let query = rawUrl[1];

      partialPhotoDatas.push({
        userId: 1,
        photoId: domain.match(/\/p\/(.+?)\//)[1],
        isClickDone: false,
        actionId: 1,
        query: query,
      });
    }

    await PartialPhotoId.bulkCreate(partialPhotoDatas, {ignoreDuplicates: true});

    let clicks = [ 
      10,
      20,
      30,
      40,
      50,
      60,
    ];

    let clickHistorys = [];
    for (let i = 0; i < clicks.length; i++) {
      const click = clicks[i];

      clickHistorys.push({
        userId: 1,
        actionId: 1,
        clickCount: click,
      });
    }

    await ClickHistory.bulkCreate(clickHistorys, {ignoreDuplicates: true});

  }

  async init(){
    await this.backupUserCookies();

    await sequelize
      .sync({force: true, alter: false})
      .then(() =>{
        console.log("OK");
      }).catch(() =>{
        console.log("[ERROR]" + error);
      });
  }

  // ユーザのクッキー情報をファイルで残す。
  // DBをリセットする前に実行する。
  async backupUserCookies(){
    await User.findAll().then(results => {
      for(let i = 0; i < results.length; i++){
        let user = results[i];
        let cookieJsonFilePath = path.join(ROOT_PATH, '/tmp/cookies', user.id + '.json');
        fs.writeFileSync(cookieJsonFilePath, user.cookieJson);
      }
    });
  }


  async test3(){
    User.findById(1).then(result => {
      console.log(result.id);
      console.log(result.username);
    }).catch(error => {
      console.log("[ERROR]" + error);
    });
  }

  async test2(){
    User.findAll({
      where: {
        id: {
          [Sequelize.Op.gt]: 0
        }
      }
    }).then(results => {
      for(let i = 0; i < results.length; i++){
        let result = results[i];
        console.log(result.id);
        console.log(result.cookieJson);
      }
    }).catch(error => {
      console.log("[ERROR]" + error);
    });

    await User.findById(1).then(result => {
      console.log(result.id);
      console.log(result.cookieJson);
    });

  }

  async test1(){
    const Op = Sequelize.Op;

    console.log('It worked');
    var user = User.create({
      username: "test",
      password: "test",
      isActive: true,
      maxClickCount: "test",
    }).then(() => {
        User.findAll({
          where: {
            id: {
              [Op.gt]: 0
            }
          }
        }).then(results => {
          for(let i = 0; i < results.length; i++){
            let result = results[i];
            console.log(result.id);
          }
        }).catch(error => {
          console.log("[ERROR]" + error);
        });
    }).catch(error => {
      console.log(error);
    });
  }

  // 後処理
  async after(){}

  // 絶対に処理
  async finally(){
  }
}

module.exports = [DbTask];