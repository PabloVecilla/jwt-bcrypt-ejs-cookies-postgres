const express = require("express");
const { getUsersWithBooks } = require("../controllers/usersController");
const { authenticateJWT, authorizeAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/users-with-books", authenticateJWT, authorizeAdmin, getUsersWithBooks);

module.exports = router;
