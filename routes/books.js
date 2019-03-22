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
    const { title, author } = req.query;
    let books;
    if (title) {
      books = await Book.findAll({
        where: { title: title },
        include: [Author]
      });
    } else if (author) {
      books = await Book.findAll({
        include: [{ model: Author, where: { title: author } }]
      });
    } else {
      books = await Book.findAll({
        include: [Author]
      });
    }
    return res.json(books);
  })
  .post(verifyToken, async (req, res) => {
    const { title, author } = req.body;
    const [foundAuthor, created] = await Author.findOrCreate({
      where: { title: author }
    });
    const newBook = await Book.create({ title: title });
    await newBook.setAuthor(foundAuthor);
    const newBookwAuthor = await Book.findOne({
      where: { id: newBook.id },
      include: [Author]
    });

    res.status(201).json(newBookwAuthor);
  });

router
  .route("/:id")
  .put(async (req, res) => {
    try {
      const book = await Book.findOne({
        where: { id: req.params.id },
        include: [Author]
      });
      const [foundAuthor, created] = await Author.findOrCreate({
        where: { title: req.body.author }
      });
      console.log(foundAuthor);
      const result = await book.update({ title: req.body.title });
      if (created) {
        await result.setAuthor(foundAuthor);
      }
      const updatedBook = await Book.findOne({
        where: { id: req.params.id },
        include: [Author]
      });
      res.status(202).json(updatedBook);
    } catch (err) {
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
