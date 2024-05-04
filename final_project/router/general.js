const express = require('express');
const books = require("./booksdb.js");
const public_users = express.Router();

public_users.get('/', (req, res) => {
  res.json(books);
});

public_users.get('/isbn/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = books.find(book => book.isbn === isbn);
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  res.json(book);
});

public_users.get('/author/:author', (req, res) => {
  const { author } = req.params;
  const filteredBooks = books.filter(book => book.author === author);
  res.json(filteredBooks);
});

public_users.get('/title/:title', (req, res) => {
  const { title } = req.params;
  const filteredBooks = books.filter(book => book.title.includes(title));
  res.json(filteredBooks);
});

module.exports = public_users;
