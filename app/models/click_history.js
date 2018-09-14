"use strict";

const Sequelize = require('sequelize');

module.exports = function(sequelize){
  class ClickHistory extends Sequelize.Model {
  }

  ClickHistory.init({
    userId: {
      field: 'user_id',
      type: Sequelize.INTEGER,
    },
    actionId: {
      field: 'action_id',
      type: Sequelize.INTEGER,
    },
    clickCount: {
      field: 'click_count',
      type: Sequelize.INTEGER,
    },
    createdAt: {
      type: Sequelize.DATE,
      field: 'created_at',
    },
  },{
    timestamps: true, // FIXME: created_atしか必要ないが、optionが正しく起動しない
    underscored: true,
    tableName: "click_histories",
    sequelize: sequelize,
  });

  global.ClickHistory = ClickHistory;
}