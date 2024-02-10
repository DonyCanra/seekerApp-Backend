'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkExperience extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      WorkExperience.belongsTo(models.Profile)
    }
  }
  WorkExperience.init({
    company: DataTypes.STRING,
    position: DataTypes.STRING,
    type: DataTypes.STRING,
    startWork: DataTypes.STRING,
    stopWork: DataTypes.STRING,
    ProfileId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'WorkExperience',
  });
  return WorkExperience;
};