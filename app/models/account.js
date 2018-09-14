"use strict";

const Sequelize = require('sequelize');

module.exports = function(sequelize){
  class Account extends Sequelize.Model {
  }

  Account.init({
    username: {
      field: 'username',
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'accountUsernameIndex',
    },
    pr: {
      field: 'pr',
      type: Sequelize.STRING,
      allowNull: true,
    },
    postNum: {
      field: 'post_num',
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    followerNum: {
      field: 'follower_num',
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    followedNum: {
      field: 'followed_num',
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    isCollect: {
      field: 'is_collect',
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    },
    point: {
      field: 'point',
      type: Sequelize.REAL,
      allowNull: true,
      defaultValue: null,
    },
  },{
    timestamps: true,
    underscored: true,
    tableName: "accounts",
    sequelize: sequelize,
  });

  global.Account = Account;
}