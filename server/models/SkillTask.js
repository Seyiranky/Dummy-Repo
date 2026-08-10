'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SkillTask extends Model {
    static associate(models) {}
  }
  SkillTask.init({}, {
    sequelize,
    modelName: 'SkillTask',
  });
  return SkillTask;
};
