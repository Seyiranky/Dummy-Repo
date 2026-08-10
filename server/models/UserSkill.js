'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserSkill extends Model {
    static associate(models) {}
  }
  UserSkill.init({}, {
    sequelize,
    modelName: 'UserSkill',
  });
  return UserSkill;
};
