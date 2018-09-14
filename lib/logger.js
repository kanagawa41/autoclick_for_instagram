const log4js = require('log4js');
log4js.configure({
  appenders: {
    out: { type: 'stdout' },
    app: {
      type: "file",
      category: "request",
      filename: "./logs/request.log",
      pattern: "-yyyy-MM-dd"
    }
  },
  categories: {
    default: { appenders: [ 'out', 'app' ], level: 'debug' }
  }
});

module.exports = log4js.getLogger('app')