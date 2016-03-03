News.allow({
  insert: function (userId, doc) {
    return (userId && doc.author === userId);
  },
  update: function (userId, doc, fields, modifier) {
    return doc.author === userId;
  },
  remove: function (userId, doc) {
    return doc.author === userId;
  },
  fetch: ['author']
});

News.deny({
  update: function (userId, docs, fields, modifier) {
    return _.contains(fields, 'author');
  }
});
