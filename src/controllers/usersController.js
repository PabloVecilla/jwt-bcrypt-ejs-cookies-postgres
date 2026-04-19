const { User, Book } = require("../models");

const getUsersWithBooks = async (_req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Book,
          as: "books",
        },
      ],
      order: [["id", "ASC"]],
    });

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Database error" });
  }
};

module.exports = { getUsersWithBooks };
