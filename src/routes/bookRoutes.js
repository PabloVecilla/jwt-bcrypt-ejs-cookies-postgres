const express = require("express");
const { getBooks, addBook, updateBook, deleteBook } = require("../controllers/bookController");
const { authenticateJWT } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/books", authenticateJWT, getBooks);
router.post("/books", authenticateJWT, addBook);
router.put("/books/:id", authenticateJWT, updateBook);
router.delete("/books/:id", authenticateJWT, deleteBook);

module.exports = router;
