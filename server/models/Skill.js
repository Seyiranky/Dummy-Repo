'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Skill extends Model {
    static associate(models) {}
  }
  Skill.init({}, {
    sequelize,
    modelName: 'Skill',
  });
  return Skill;
};
