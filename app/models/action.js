"use strict";

const Sequelize = require('sequelize');

module.exports = function(sequelize){
  const model = sequelize.define('action', {
    actionName: {
      field: 'action_name',
      type: Sequelize.STRING,
      allowNull: false,
    },
    note: {
      field: 'note',
      type: Sequelize.STRING,
      allowNull: true,
    },
  },{
    timestamps: false,
    underscored: true,
    tableName: "actions",
    sequelize: sequelize,
  });

  // FIXME: 出力先で行いたい
  global.Action = model;
}