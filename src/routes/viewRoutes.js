const express = require("express");
const {
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
} = require("../controllers/viewController");

const router = express.Router();
router.get("/", goToLogin);
router.get("/login", showLogin);
router.post("/login", login);
router.get("/register", showRegister);
router.post("/register", register);
router.get("/books", showBooks);
router.post("/books", createBook);
router.post("/books/:id/update", updateBook);
router.post("/books/:id/delete", deleteBook);
router.post("/logout", logout);

module.exports = router;
