'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    static associate(models) {}
  }
  Transaction.init({}, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};
