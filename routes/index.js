const express = require("express");
const books = require("../routes/books");
const router = express.Router();

router.route("/").get((req, res) => {
  res.sendStatus(200);
});

router.use("/books", books);

module.exports = router;
