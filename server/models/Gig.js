'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Gig extends Model {
    static associate(models) {}
  }
  Gig.init({}, {
    sequelize,
    modelName: 'Gig',
  });
  return Gig;
};
