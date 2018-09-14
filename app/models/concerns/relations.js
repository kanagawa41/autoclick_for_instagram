"use strict";

let fs = require('fs');
let path = require('path');
const Sequelize = require('sequelize');

/**
 * 概要: DBの関係性
 */
module.exports = function(sequelize){
  // モデルの読み込み
  let models = fs.readdirSync(MODEL_PATH).filter(function(file){
    // jsファイルのみをターゲット
    return /.+\.js$/.test(file);
  });
  for (var i = 0; i < models.length; i++) {
    require(path.join(MODEL_PATH, models[i]))(sequelize);
  }

  /**
   * リレーションを貼る
   */
  // User.hasMany(PartialPhotoId);
  // Action.hasMany(PartialPhotoId);
  // PartialPhotoId.belongsTo(User);
  // PartialPhotoId.belongsTo(Action);

  // User.hasMany(ClickHistory);
  // Action.hasMany(ClickHistory);
  // ClickHistory.belongsTo(User);
  // ClickHistory.belongsTo(Action);

  // User.hasMany(ActionHistory);
  // ActionHistory.belongsTo(User);
}