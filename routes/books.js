const uuid = require("uuid/v4");
const express = require("express");
const router = express.Router();
const { books: oldbooks } = require("../data/db.json");
const { Book, Author } = require("../models");

const filterBooksBy = (property, value) => {
  return oldbooks.filter(b => b[property] === value);
};

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.sendStatus(403);
  } else {
    if (authorization === "Bearer my-awesome-token") {
      next();
    } else {
      res.sendStatus(403);
    }
  }
};

router
  .route("/")
  .get(async (req, res) => {
    const books = await Book.findAll({
      include: [Author]
    });
    return res.json(books);
  })
  .post(verifyToken, (req, res) => {
    const book = req.body;
    book.id = uuid();
    res.status(201).json(req.body);
  });

router
  .route("/:id")
  .put((req, res) => {
    const book = oldbooks.find(b => b.id === req.params.id);
    if (book) {
      res.status(202).json(req.body);
    } else {
      res.sendStatus(400);
    }
  })
  .delete((req, res) => {
    const book = oldbooks.find(b => b.id === req.params.id);
    if (book) {
      res.sendStatus(202);
    } else {
      res.sendStatus(400);
    }
  });

module.exports = router;
