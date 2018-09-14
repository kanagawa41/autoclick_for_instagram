const { WebClient } = require('@slack/client');

/**
 * 概要: タグストリームでURLを採集する
 */
class Slack {
  constructor(){
    // An access token (from your Slack app or custom integration - xoxp, xoxb, or xoxa)
    const token = process.env.SLACK_TOKEN;
    this.conversationId = process.env.SLACK_CONVERSATION_ID;
    this.web = new WebClient(token);
  }

  taskInfo(taskname, message, detail){
    const attachments = [{
      "color": "#36a64f",
      "author_name": taskname,
      // "title": "Slack API Documentation",
      "text": detail,
    },];

    this.chat(message, attachments);
  }

  taskInfoWithImg(taskname, message, imagePath){
    const attachments = [{
      "color": "good",
      "author_name": taskname,
      "title": "実行後キャプチャ",
      "title_link": process.env.APP_DOMAIN + ':' + process.env.APP_PORT + "/images/" + imagePath,
    },];

    this.chat(message, attachments);
  }

  taskInfoWithLog(taskname, logFilename){
    const attachments = [{
      "color": "good",
      "author_name": taskname,
      "title": "実行ログ",
      "title_link": process.env.APP_DOMAIN + ':' + process.env.APP_PORT + "/logs/" + logFilename,
    },];

    this.chat("Pid of task", attachments);
  }

  taskError(taskname, message, detail){
    const attachments = [{
      "color": "danger",
      "author_name": taskname,
      // "title": "Slack API Documentation",
      "text": detail,
    },];

    this.chat(message, attachments);
  }

  chat(context, attachments){
    // See: https://api.slack.com/methods/chat.postMessage
    this.web.chat.postMessage({
      channel: this.conversationId,
      text: context,
      attachments: attachments,
    })
    .then((res) => {
      // `res` contains information about the posted message
      console.log('Message sent: ', res.ts);
    }).catch(console.error);
  }

  // TODO 画像送信ができればいいな
  // image(){
  //   // See: https://api.slack.com/methods/chat.postMessage
  //   web.files.upload({
  //     filename,
  //     // You can use a ReadableStream or a Buffer for the file option
  //     file: fs.createReadStream(`./${fileName}`),
  //     // Or you can use the content property (but not both)
  //     // content: 'plain string content that will be editable in Slack'
  //   })
  //     .then((res) => {
  //       // `res` contains information about the uploaded file
  //       console.log('File uploaded: ', res.file.id);
  //     })
  //     .catch(console.error);
  // }
}

module.exports = new Slack();