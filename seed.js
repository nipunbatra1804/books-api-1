const { Author, Book } = require("./models");
const createAuthorsAndBooks = async () => {
  await Author.create(
    {
      title: "Orwell",
      books: [{ title: "Animal Farm" }, { title: "1984" }]
    },
    { include: [Book] }
  );
  await Author.create(
    {
      title: "Aldous Huxley",
      books: [{ title: "Brave New World" }]
    },
    { include: [Book] }
  );
  await Author.create(
    {
      title: "Ray Bradbury",
      books: [{ title: "Fahrenheit 451" }]
    },
    { include: [Book] }
  );

  return Promise.resolve();
};

module.exports = createAuthorsAndBooks;
