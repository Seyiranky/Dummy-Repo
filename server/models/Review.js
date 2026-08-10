'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {}
  }
  Review.init({}, {
    sequelize,
    modelName: 'Review',
  });
  return Review;
};
