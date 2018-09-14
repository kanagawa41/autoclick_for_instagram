"use strict";

let fs = require("fs");
let path = require('path');
require('date-utils');

/**
 * 概要: puppeteerのマッパークラス
 */
module.exports = class PageUtil {
  /**
   * クッキーファイル(json)を保存
   */
  static async saveCookie(page, cookieJsonFilePath) {
    const afterCookies = await page.cookies();
    fs.writeFileSync(cookieJsonFilePath, JSON.stringify(afterCookies));
  }

  /**
   * クッキーファイル(json)を読み込む
   */
  static async setCookie(page, cookieJson) {
    try {
      let cookies = JSON.parse(cookieJson);

      for (let cookie of cookies) {
        await page.setCookie(cookie);
      }
    } catch(e) {
      if(e.message.match(/^Protocol error.+/i)) {
        return false;
      } else {
        throw e;
      }
    }

    return true;
  }

  /**
   * 指定URLに遷移する
   */
  static async goto(page, url) {
    // オプションは画面のロードを待つおまじない
    return await page.goto(url, {waitUntil: 'networkidle2'});
  }

  // プロフィールURLの生成
  static makeProfileUrl(username){
    return "https://www.instagram.com/" + username + "/";
  }

  // タグURLの生成
  static makeTagUrl(tag){
    return "https://www.instagram.com/explore/tags/" + tag + "/";
  }

  // 写真URLの生成
  static makePhotoUrl(photoId, query){
    return "https://www.instagram.com/p/" + photoId + "/?" + query;
  }

  /**
   * ログインしている状態かチェックする。
   */
  static async isLogined(page, user) {
    let isLogin = await page.evaluate((username) => {
      let anchor = document.querySelector('#react-root > section > nav > div:nth-child(2) > div > div > div:nth-child(3) > div > div:nth-child(3) > a');
      if(anchor){
        let regExp = new RegExp('\/' + username + '\/');
        return anchor.getAttribute('href').match(regExp);
      }else{
        return false;
      }
    }, user.username);

    isLogin = Boolean(isLogin);

    user.isValidCookie = isLogin;
    user.save();

    return isLogin;
  }

  /**
   * 画面キャプチャ―を撮る。ファイル名にサフィックス（日付-YYYYMMDD）が付与され、同一名があった場合は上書きされる。
   */
  static async capture(page, name) {
    let dt = new Date();
    let targetPath = path.join(ROOT_PATH, 'tmp/captures');
    const imageName = name + '_' + dt.toFormat("YYMMDDHH24MISS") + '.jpg';
    const imagePath = path.join(targetPath, imageName);

    await page.screenshot({path: imagePath});

    return imageName;
  }

  /**
   * ページをスクロールする。リトライ回数を超えるとスクロールを中止する。
   */
  static async autoScroll(page, retryCount=null){
    return page.evaluate((retryCount=null) => {
      return new Promise((resolve, reject) => {
        var tryCount = 0;
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          tryCount++;

          if(totalHeight >= scrollHeight){
            clearInterval(timer);
            resolve();
          } else if(retryCount && tryCount >= retryCount) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      })
    }, retryCount);
  }

  /**
   * bodyタグのinnerHTMLを返却する
   */
  static async getBodyHtml(page) {
    return await page.evaluate(() => document.body.innerHTML);
  }
}
