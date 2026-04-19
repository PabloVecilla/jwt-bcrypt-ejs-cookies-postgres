const { Book } = require("../models");

const getBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { userId: req.user.id },
      attributes: ["id", "title", "author", "country", "language", "pages", "year"],
      order: [["id", "ASC"]],
    });

    return res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ message: "Database error" });
  }
};

const addBook = async (req, res) => {
  const { title, author, country, language, pages, year } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const book = await Book.create({
      title,
      author: author || "Desconocido",
      country: country || "Desconocido",
      language: language || "Desconocido",
      pages: Number(pages) || 0,
      year: Number(year) || null,
      userId: req.user.id,
    });

    return res.status(201).json({ message: "Libro añadido correctamente", book });
  } catch (error) {
    return res.status(500).json({ message: "Error base de datos" });
  }
};

const updateBook = async (req, res) => {
  const { title, author, country, language, pages, year } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const book = await Book.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!book) {
      return res.status(404).json({ message: "Libro no encontrado" });
    }

    await book.update({
      title,
      author: author || book.author,
      country: country || book.country,
      language: language || book.language,
      pages: pages === undefined ? book.pages : Number(pages) || 0,
      year: year === undefined ? book.year : Number(year) || null,
    });

    return res.status(200).json({ message: "Libro actualizado correctamente", book });
  } catch (error) {
    return res.status(500).json({ message: "Error base de datos" });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!book) {
      return res.status(404).json({ message: "Libro no encontrado" });
    }

    await book.destroy();

    return res.status(200).json({ message: "Libro eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error base de datos" });
  }
};

module.exports = { getBooks, addBook, updateBook, deleteBook };
