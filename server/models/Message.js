'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {}
  }
  Message.init({}, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};
