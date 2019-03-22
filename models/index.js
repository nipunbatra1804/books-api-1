const Sequelize = require("sequelize");

//Creat connection
const sequelize = new Sequelize("books-api", "postgres", "", {
  dialect: "postgres"
});
//Pass the models to the connection
const models = {
  Book: sequelize.import("./book.js"),
  Author: sequelize.import("./author.js")
};

//Link up all the models
Object.keys(models).forEach(key => {
  if ("associate" in models[key]) {
    models[key].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
