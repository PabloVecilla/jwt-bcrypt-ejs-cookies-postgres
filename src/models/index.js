const User = require("./User");
const Book = require("./Book");

User.hasMany(Book, {
  foreignKey: "userId",
  as: "books",
});

Book.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

module.exports = {
  User,
  Book,
};
