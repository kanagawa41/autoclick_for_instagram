"use strict";

const Sequelize = require('sequelize');

module.exports = function(sequelize){
  class PartialPhotoId extends Sequelize.Model {
  }
  PartialPhotoId.init({
    userId: {
      field: 'user_id',
      type: Sequelize.INTEGER,
      unique: 'userIdPhotoIdIndex'
    },
    actionId: {
      field: 'action_id',
      type: Sequelize.INTEGER,
    },
    photoId: {
      field: 'photo_id',
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'userIdPhotoIdIndex'
    },
    isClickDone: {
      field: 'is_click_done',
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    query: {
      field: 'query',
      type: Sequelize.STRING,
      allowNull: true,
    },
  },{
    timestamps: true,
    underscored: true,
    tableName: "partial_photo_ids",
    sequelize: sequelize,
  });

  global.PartialPhotoId = PartialPhotoId;
}