import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

Meteor.users.allow({
  update: function(userId, docs, fields, modifier) {
    return userId === doc._id;
  }
});


if(Meteor.isClient){
  //collection
  import { Citoyens } from './citoyens.js'

  Meteor.users.helpers({
    citoyen () {
      return Citoyens.findOne(new Mongo.ObjectID(this._id));
    }
  });

}
