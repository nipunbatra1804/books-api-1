const app = require("./app");
const { sequelize } = require("./models");
const createAuthorsAndBooks = require("./seed");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const port = process.env.PORT || 8080;

sequelize.sync({ force: true }).then(() => {
  createAuthorsAndBooks();
  app.listen(port, () => {
    if (process.env.NODE_ENV === "production") {
      console.log(`Server is running on Heroku with port number ${port}`);
    } else {
      console.log(`Server is running on http://localhost:${port}`);
    }
  });
});
