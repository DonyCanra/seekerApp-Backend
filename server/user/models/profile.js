"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Profile.hasMany(models.Education);
      Profile.hasMany(models.WorkExperience);
      Profile.belongsTo(models.User);
    }
  }
  Profile.init(
    {
      fullName: DataTypes.STRING,
      aboutMe: DataTypes.TEXT,
      sayName: DataTypes.STRING,
      birthDate: DataTypes.STRING,
      gender: DataTypes.STRING,
      phoneNumber: DataTypes.STRING,
      domisili: DataTypes.STRING,
      photoUrl: DataTypes.TEXT,
      CV: DataTypes.TEXT,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Profile",
    }
  );
  Profile.beforeCreate("register", (profile) => {
    profile.fullName = profile.aboutMe = profile.sayName = profile.birthDate = profile.gender = profile.phoneNumber = profile.domisili = "Belum di isi";
    profile.photoUrl = "https://www.seekpng.com/png/full/73-730482_existing-user-default-avatar.png";
    profile.CV = "none";
  });
  return Profile;
};
