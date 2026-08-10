'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Match extends Model {
    static associate(models) {}
  }
  Match.init({}, {
    sequelize,
    modelName: 'Match',
  });
  return Match;
};
