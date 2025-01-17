const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../app");
const { Book, Author } = require("../../models");
const { sequelize } = require("../../models");
const createAuthorsAndBooks = require("../../seed");

const route = (params = "") => {
  const path = "/api/v1/books";
  return `${path}/${params}`;
};

describe("Books", () => {
  let mongod;
  let db;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    await createAuthorsAndBooks();
  });

  beforeEach(async () => {});

  afterEach(async () => {});

  afterAll(async () => {
    sequelize.close();
  });

  describe("[GET] Search for books", () => {
    const expectedBooks = [
      { id: 1, title: "Animal Farm", author: { name: "Orwell" } },
      { id: 2, title: "1984", author: { name: "Orwell" } },
      {
        id: 5,
        title: "Brave New World",
        author: { name: "Aldous Huxley" }
      },
      { id: 6, title: "Fahrenheit 451", author: { name: "Ray Bradbury" } }
    ];
    const verifyBooks = (res, expected) => {
      const books = res.body;
      books.forEach((book, index) => {
        expect(book.title).toBe(expected[index].title);
        expect(book.author.title).toEqual(expected[index].author.name);
      });
    };

    test("returns all books", async done => {
      await request(app)
        .get(route())
        .expect("content-type", /json/)
        .expect(200)
        .then(res => verifyBooks(res, expectedBooks));

      done();
    });

    test("returns books matching the title query", async () => {
      await request(app)
        .get(route())
        .query({ title: "1984" })
        .expect("content-type", /json/)
        .expect(200)
        .then(res => {
          const book = res.body[0];
          expect(book.title).toEqual("1984");
        });
    });

    test("returns books matching the author query", async () => {
      const verifyAuthor = (books, expectedAuthor) => {
        books.forEach(book =>
          expect(book.author.title).toEqual(expectedAuthor)
        );
      };

      const res = await request(app)
        .get(route())
        .query({ author: "Orwell" })
        .expect("content-type", /json/)
        .expect(200)
        .expect(res => verifyAuthor(res.body, "Orwell"));
    });
  });

  describe("[POST] Creates a new book", () => {
    test("denies access when no token is given", () => {
      return request(app)
        .post(route())
        .send({ title: "The Handmaid's Tale", author: "Margaret Atwood" })
        .catch(err => {
          expect(err.status).toBe(403);
        });
    });

    test("denies access when invalid token is given", () => {
      return request(app)
        .post(route())
        .set("Authorization", "Bearer some-invalid-token")
        .send({ title: "The Handmaid's Tale", author: "Margaret Atwood" })
        .catch(res => {
          expect(res.status).toBe(403);
        });
    });

    test("creates a new book record in the database", async () => {
      const res = await request(app)
        .post(route())
        .set("Authorization", "Bearer my-awesome-token")
        .send({ title: "The Handmaid's Tale", author: "Margaret Atwood" })
        .expect(201);

      expect(res.body.title).toBe("The Handmaid's Tale");
      expect(res.body.author.title).toBe("Margaret Atwood");

      const book = await Book.findOne({
        where: { title: "The Handmaid's Tale" },
        include: [{ model: Author, where: { title: "Margaret Atwood" } }]
      });
      expect(book.title).toBe("The Handmaid's Tale");
      expect(book.author.title).toBe("Margaret Atwood");
    });
  });

  describe("[PUT] Edits an existing book", () => {
    test("edits a book's title and author", async () => {
      const { id } = await Book.findOne({ where: { title: "1984" } });
      //console.log(id);
      const res = await request(app)
        .put(route(id))
        .send({
          title: "1984-1",
          author: "Orwell"
        })
        .expect(202);

      expect(res.body.title).toBe("1984-1");
      expect(res.body.author.title).toBe("Orwell");

      const book = await Book.findOne({
        where: { title: "1984-1" },
        include: [Author]
      });
      expect(book.title).toBe("1984-1");
      expect(book.author.title).toBe("Orwell");
    });

    test("returns 400 Bad Request as there is no such book", () => {
      const id = "100";
      return request(app)
        .put(route(id))
        .send({
          id: 100,
          title: "The Perennial Philosophy",
          author: "Aldous Huxley"
        })
        .catch(res => {
          expect(res.status).toBe(400);
        });
    });
  });

  describe("[DELETE] Removes an existing book", () => {
    test("removes a book from the database", async () => {
      const delBook = await Book.findOne({
        where: { title: "The Handmaid's Tale" }
      });

      await request(app)
        .delete(route(delBook.id))
        .expect(202);
      const book = await Book.findOne({
        where: { id: delBook.id },
        include: [Author]
      });
      expect(book).toBe(null);
    });

    test("returns 404 Not Found as there is no such book", done => {
      const id = "5c8fb5c41529bf25dcba41a7";
      request(app)
        .delete(route(id))
        .expect(404, done);
    });
  });
});
