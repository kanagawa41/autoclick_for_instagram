# Quick Tip: Getting Started with Headless Chrome in Node.js

Brain Greig shows you how to get up and running with Headless Chrome and demonstrates how to capture screenshots of pages as you use it to navigate a site.

Read article on SitePoint: https://www.sitepoint.com/headless-chrome-node-js

## Requirements

* [Node.js](http://nodejs.org/)

## Installation Steps (if applicable)

1. Clone repo
2. Run `npm install`
3. Run `node index.jsr`

## License

SitePoint's code archives and code examples are licensed under the MIT license.

Copyright © 2017 SitePoint

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## dockerを起動する
```
$ docker-compose up -d 2>&1 | logger -ip cron.info
```

## taskを実行する
```
$ node index.js xxx
# e.g.) node index.js test
```

## taskAPIを起動する
```
$ node lib/api_app.js
```

## taskAPIを実行する
```
$ curl localhost:5000/api/tasks/XXXX?args=XXXX:XXXX
# e.g.) curl localhost:5000/api/tasks/test?
```

## TODO
* 古い画像等をどんどんケス
* initタスクを、DBファイルを作成するタスク、ユーザを登録するタスクに分割する
* タスクへの引数の渡し方をrailsに寄せる。（区切りを, 、引数は[]で囲む）

## DONE
* ユーザ情報を更新できるタスクを作成する。
 * 画面を作成する？
* 実行キャプチャ画面を、送信するか、URLから参照できるようにする
* 実行したタスクの状況を監視できるようにしたい。(redisを導入する？)
