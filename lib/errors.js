const ERROR = {};

// 予期しない挙動場合
ERROR.Unexpected = class extends Error {}
ERROR.Unexpected.prototype.name = "Unexpected";

// 引数が正しくない場合
ERROR.InvalidArgs = class extends Error {}
ERROR.InvalidArgs.prototype.name = "InvalidArgs";

// アクションが見つからない場合
ERROR.NotFoundAction = class extends Error {}
ERROR.NotFoundAction.prototype.name = "NotFoundAction";

// ページが見つからない場合
ERROR.NotFoundPage = class extends Error {}
ERROR.NotFoundPage.prototype.name = "NotFoundPage";

// 要素(dom)がない場合
ERROR.NotFoundElement = class extends Error {}
ERROR.NotFoundElement.prototype.name = "NotFoundElement";

// クッキーが有効でない
ERROR.InvalidCookie = class extends Error {}
ERROR.InvalidCookie.prototype.name = "InvalidCookie";

module.exports = ERROR;