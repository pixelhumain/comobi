//https://github.com/dburles/meteor-collection-helpers
Meteor.users.helpers({
  citoyen () {
    return Citoyens.findOne(new Mongo.ObjectID(this._id));
  }
});
