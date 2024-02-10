'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Education extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Education.belongsTo(models.Profile)
    }
  }
  Education.init({
    educationalLevel: DataTypes.STRING,
    College: DataTypes.STRING,
    Major: DataTypes.STRING,
    startEducation: DataTypes.STRING,
    graduatedEducation: DataTypes.STRING,
    ProfileId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Education',
  });
  return Education;
};