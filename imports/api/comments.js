import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { moment } from 'meteor/momentjs:moment';

// collection
import { Citoyens } from './citoyens.js';

export const Comments = new Mongo.Collection('comments', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
// Index
  Comments.rawCollection().createIndex(
    { contextId: 1 },
    { name: 'contextId', partialFilterExpression: { contextId: { $exists: true } }, background: true }
    , (e) => {
      if (e) {
        // console.log(e);
      }
    });
}

/* {
    "_id" : ObjectId("58a6e87e40bb4e187b545623"),
    "contextId" : "58a35bba40bb4e4b2d545623",
    "contextType" : "surveys",
    "parentId" : "",
    "text" : "Pour :\n- permet de faire connaitre et d'utiliser communecter\n- plus facile d'accès que le loomio\nContre :\n- pas de modification de vote (droit à l'erreur ?)",
    "created" : NumberLong(1487333502),
    "author" : "573adc7e40bb4ec5659a9f2e",
    "tags" : null,
    "status" : "posted"
} */


export const SchemasCommentsRest = new SimpleSchema({
  content: {
    type: String,
  },
  parentCommentId: {
    type: String,
    optional: true,
  },
  contextId: {
    type: String,
  },
  contextType: {
    type: String,
  },
});

export const SchemasCommentsEditRest = new SimpleSchema({
  text: {
    type: String,
  },
  parentCommentId: {
    type: String,
    optional: true,
  },
  contextId: {
    type: String,
  },
  contextType: {
    type: String,
  },
});


if (Meteor.isClient) {
  Comments.helpers({
    authorComments () {
      return Citoyens.findOne({ _id: new Mongo.ObjectID(this.author) });
    },
    dateComments () {
      return moment.unix(this.created).format('YYYY-MM-DD HH:mm');
    },
    likesCount () {
      if (this.voteUp && this.voteUpCount) {
        return this.voteUpCount;
      }
      return 0;
    },
    dislikesCount () {
      if (this.voteDown && this.voteDownCount) {
        return this.voteDownCount;
      }
      return 0;
    },
    isAuthor () {
      return this.author === Meteor.userId();
    },
  });
} else {
  Comments.helpers({
    authorComments () {
      return Citoyens.findOne({ _id: new Mongo.ObjectID(this.author) });
    },
    likesCount () {
      if (this.voteUp && this.voteUpCount) {
        return this.voteUpCount;
      }
      return 0;
    },
    dislikesCount () {
      if (this.voteDown && this.voteDownCount) {
        return this.voteDownCount;
      }
      return 0;
    },
    isAuthor () {
      return this.author === Meteor.userId();
    },
  });
}
