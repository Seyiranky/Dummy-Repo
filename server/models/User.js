'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.UserSkill, { foreignKey: 'userId', as: 'userSkills' });
      User.hasMany(models.SkillTask, { foreignKey: 'workerId', as: 'submittedTasks' });
      User.hasMany(models.SkillTask, { foreignKey: 'reviewerId', as: 'reviewedTasks' });
      User.hasMany(models.Gig, { foreignKey: 'clientId', as: 'postedGigs' });
      User.hasMany(models.Match, { foreignKey: 'workerId', as: 'matches' });
      User.hasMany(models.Review, { foreignKey: 'authorId', as: 'reviewsGiven' });
      User.hasMany(models.Review, { foreignKey: 'recipientId', as: 'reviewsReceived' });
      User.hasMany(models.Message, { foreignKey: 'senderId', as: 'sentMessages' });
      User.hasMany(models.Message, { foreignKey: 'recipientId', as: 'receivedMessages' });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isIn: [['worker', 'client', 'mentor', 'admin']] },
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      locationLat: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      locationLng: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      trustScore: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'User',
      defaultScope: {
        attributes: { exclude: ['passwordHash'] },
      },
      scopes: {
        withPassword: {
          attributes: {},
        },
      },
    },
  );
  return User;
};
