const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, Book } = require("../models");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "somerandomaccesstoken";

const getSessionUser = (req) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, accessTokenSecret);
  } catch (_error) {
    return null;
  }
};

const goToLogin = (_req, res) => {
  res.redirect("/login");
};

const showLogin = (req, res) => {
  const sessionUser = getSessionUser(req);

  if (sessionUser) {
    return res.redirect("/books");
  }

  return res.render("login", { pageTitle: "Login", message: "" });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("login", { pageTitle: "Login", message: "Rellena usuario y password" });
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.render("login", { pageTitle: "Login", message: "Credenciales invalidas" });
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      accessTokenSecret,
      { expiresIn: "20m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 20 * 60 * 1000,
    });

    return res.redirect("/books");
  } catch (_error) {
    return res.render("login", { pageTitle: "Login", message: "Error de base de datos" });
  }
};

const showRegister = (_req, res) => {
  res.render("register", { pageTitle: "Register", message: "" });
};

const register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.render("register", { pageTitle: "Register", message: "Rellena usuario y password" });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      return res.render("register", { pageTitle: "Register", message: "Ese username ya existe" });
    }

    await User.create({
      username,
      passwordHash: await bcrypt.hash(password, 10),
      role: role === "admin" ? "admin" : "user",
    });

    return res.render("login", { pageTitle: "Login", message: "Usuario creado, ahora haz login" });
  } catch (_error) {
    return res.render("register", { pageTitle: "Register", message: "Error de base de datos" });
  }
};

const showBooks = async (req, res) => {
  const sessionUser = getSessionUser(req);

  if (!sessionUser) {
    return res.render("books", { pageTitle: "Mis libros", loggedIn: false, books: [] });
  }

  try {
    const books = await Book.findAll({ where: { userId: sessionUser.id } });
    return res.render("books", { pageTitle: "Mis libros", loggedIn: true, books });
  } catch (_error) {
    return res.render("books", { pageTitle: "Mis libros", loggedIn: true, books: [] });
  }
};

const createBook = async (req, res) => {
  const sessionUser = getSessionUser(req);

  if (!sessionUser) {
    return res.redirect("/login");
  }

  const { title, author, country, language, pages, year } = req.body;

  if (!title) {
    return res.redirect("/books");
  }

  try {
    await Book.create({
      title,
      author: author || "Desconocido",
      country: country || "Desconocido",
      language: language || "Desconocido",
      pages: Number(pages) || 0,
      year: Number(year) || null,
      userId: sessionUser.id,
    });
  } catch (_error) {
    // Si falla, volvemos a la lista sin romper la vista.
  }

  return res.redirect("/books");
};

const updateBook = async (req, res) => {
  const sessionUser = getSessionUser(req);

  if (!sessionUser) {
    return res.redirect("/login");
  }

  const { title, author, country, language, pages, year } = req.body;

  if (!title) {
    return res.redirect("/books");
  }

  try {
    await Book.update(
      {
        title,
        author: author || "Desconocido",
        country: country || "Desconocido",
        language: language || "Desconocido",
        pages: Number(pages) || 0,
        year: Number(year) || null,
      },
      { where: { id: req.params.id, userId: sessionUser.id } }
    );
  } catch (_error) {
    // Si falla, volvemos a la lista sin romper la vista.
  }

  return res.redirect("/books");
};

const deleteBook = async (req, res) => {
  const sessionUser = getSessionUser(req);

  if (!sessionUser) {
    return res.redirect("/login");
  }

  try {
    await Book.destroy({ where: { id: req.params.id, userId: sessionUser.id } });
  } catch (_error) {
    // Si falla, volvemos a la lista sin romper la vista.
  }

  return res.redirect("/books");
};

const logout = (_req, res) => {
  res.clearCookie("accessToken");
  return res.redirect("/login");
};

module.exports = {
  goToLogin,
  showLogin,
  login,
  showRegister,
  register,
  showBooks,
  createBook,
  updateBook,
  deleteBook,
  logout,
};
