"use strict";

const Sequelize = require('sequelize');

module.exports = function(sequelize){
  class ActionHistory extends Sequelize.Model {
  }

  ActionHistory.init({
    userId: {
      field: 'user_id',
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    actionId: {
      field: 'action_id',
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    isSuccess: {
      field: 'is_success',
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },{
    timestamps: true, // FIXME: created_atしか必要ないが、optionが正しく起動しない
    underscored: true,
    tableName: "action_histories",
    sequelize: sequelize,
  });

  global.ActionHistory = ActionHistory;
}