import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

if (Meteor.isClient) {
  // collection
  import { Citoyens } from './citoyens.js';

  Meteor.users.helpers({
    citoyen () {
      return Citoyens.findOne(new Mongo.ObjectID(this._id));
    },
  });
}
