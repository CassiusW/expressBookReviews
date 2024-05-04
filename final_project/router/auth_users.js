const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: 'user1', password: 'pass1' },
  { username: 'user2', password: 'pass2' }
];

const isValid = (username) => {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const user = { username };
  const accessToken = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
  return res.json({ accessToken });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const username = decoded.username;

  let book = books.find(b => b.isbn === isbn);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!book.reviews) {
    book.reviews = [];
  }
  const userReviewIndex = book.reviews.findIndex(r => r.username === username);
  if (userReviewIndex !== -1) {
    book.reviews[userReviewIndex].review = review;
  } else {
    book.reviews.push({ username, review });
  }
  return res.json({ message: "Review updated", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const username = decoded.username;

  let book = books.find(b => b.isbn === isbn);
  if (!book || !book.reviews) {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
  const initialReviewsCount = book.reviews.length;
  book.reviews = book.reviews.filter(review => review.username !== username);
  if (initialReviewsCount === book.reviews.length) {
    return res.status(404).json({ message: "No review by the user found" });
  }
  return res.json({ message: "Review deleted", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
