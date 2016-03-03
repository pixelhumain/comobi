Events.allow({
  insert: function (userId, doc) {
    return (userId && doc.creator === userId);
  },
  update: function (userId, doc, fields, modifier) {
    return doc.creator === userId;
  },
  remove: function (userId, doc) {
    return doc.creator === userId;
  },
  fetch: ['creator']
});

Events.deny({
  update: function (userId, docs, fields, modifier) {
    return _.contains(fields, 'creator');
  }
});
