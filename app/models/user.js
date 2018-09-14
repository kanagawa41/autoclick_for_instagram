"use strict";

const Sequelize = require('sequelize');

module.exports = function(sequelize){
  class User extends Sequelize.Model {
    // クッキーが有効な状態にする
    updateCookieWell(cookieJson) {
      this.cookieJson = cookieJson;
      this.isValidCookie = true;
      this.save();
    }

    // クッキーが無効な状態にする
    updateCookieBadly() {
      this.isValidCookie = false;
      this.save();
    }
  }

  User.init({
    username: {
      field: 'username',
      type: Sequelize.STRING,
      allowNull: false,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    isActive: {
     field: 'is_active',
     type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    maxClickCount: {
      field: 'max_click_count',
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    cookieJson: {
      field: 'cookie_json',
      type: Sequelize.STRING,
      allowNull: true,
    },
    isValidCookie: {
     field: 'is_valid_cookie',
     type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    tags: {
      field: 'tags',
      type: Sequelize.STRING,
      allowNull: false,
    },
  },{
    timestamps: true,
    underscored: true,
    tableName: "users",
    sequelize: sequelize,
  })

  global.User = User;
}