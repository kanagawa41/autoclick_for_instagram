"use strict";

let puppeteer = require('puppeteer');

/**
 * 概要: puppeteerのマッパークラス
 */
module.exports = class MyBrowser {
  constructor() {
  }

  /**
   * ブラウザを生成する
   */
  async _launch() {
    return await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
  }

  /**
   * ページオブジェクトの生成
   */
  async newPage() {
    this.browser = await this._launch();
    let page = await this.browser.newPage();

    // evaluateで使用できるファンクションの設定
    page.on('console', (log) => console[log._type](log._text));

    return page;
  }

  /**
   * 後処理
   */
  close() {
    this.browser.close();
  }
}