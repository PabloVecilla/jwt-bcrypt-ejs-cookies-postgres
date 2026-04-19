const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Book = sequelize.define(
  "Book",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Unknown",
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Unknown",
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Unknown",
    },
    pages: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
  },
  {
    tableName: "books",
    timestamps: false,
  }
);

module.exports = Book;
