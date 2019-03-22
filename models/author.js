module.exports = (sequelize, type) => {
  const Author = sequelize.define(
    "author",
    {
      id: { type: type.INTEGER, primaryKey: true, autoIncrement: true },
      title: type.STRING
    },
    { timestamps: false }
  );
  Author.associate = models => {
    Author.hasMany(models.Book);
  };

  return Author;
};
