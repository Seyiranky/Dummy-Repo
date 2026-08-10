'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Gig extends Model {
    static associate(models) {
      Gig.belongsTo(models.User, { foreignKey: 'clientId', as: 'client' });
      Gig.belongsTo(models.Skill, { foreignKey: 'skillId', as: 'skill' });
      Gig.hasMany(models.Match, { foreignKey: 'gigId', as: 'matches' });
    }
  }
  Gig.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      clientId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      skillId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      budget: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      locationLat: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      locationLng: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'open',
        validate: { isIn: [['open', 'matched', 'completed', 'cancelled']] },
      },
    },
    {
      sequelize,
      modelName: 'Gig',
    },
  );
  return Gig;
};
