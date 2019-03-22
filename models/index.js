const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
//Creat connection
if (env === "production") {
  sequelize = new Sequelize(config.url, config.options);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config.options
  );
}

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
