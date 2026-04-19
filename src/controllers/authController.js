const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../models");

const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "somerandomaccesstoken";

const register = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const safeRole = role === "admin" ? "admin" : "user";

  try {
    const existingUser = await User.findOne({ where: { username } });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      passwordHash,
      role: safeRole,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error" });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
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

    return res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(500).json({ message: "Database error" });
  }
};

const logout = (_req, res) => {
  res.clearCookie("accessToken");
  return res.status(200).json({ message: "Sesion cerrada" });
};

module.exports = { register, login, logout };










// const jwt = require('jsonwebtoken');

// const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "somerandomaccesstoken";

// const users = [
//     { username: 'data', password: 'password123' },
//     { username: 'carlos', password: 'password123' }
// ];

// const login = (req, res) => {
//     const { username, password } = req.body;

//     if (!username || !password) {
//         return res.status(400).json({ message: 'Username and password are required' });
//     }

//     const user = users.find(u => u.username === username && u.password === password);

//     if (user) {
//         const accessToken = jwt.sign({ username: user.username }, accessTokenSecret, { expiresIn: '20m' });

//         res.status(200).json({ accessToken });
//     } else {
//         res.status(401).json({ message: 'Invalid username or password' });
//     }
// };

// module.exports = { login };
