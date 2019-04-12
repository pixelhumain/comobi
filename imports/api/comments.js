import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';
import { Tracker } from 'meteor/tracker';

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
  text: {
    type: String,
  },
  parentCommentId: {
    type: String,
    optional: true,
  },
  argval: {
    type: String,
    optional: true,
  },
  contextId: {
    type: String,
  },
  contextType: {
    type: String,
  },
  mentions: {
    type: Array,
    optional: true,
  },
  'mentions.$': {
    type: Object,
    optional: true,
  },
  'mentions.$.id': {
    type: String,
    optional: true,
  },
  'mentions.$.name': {
    type: String,
    optional: true,
  },
  'mentions.$.avatar': {
    type: String,
    optional: true,
  },
  'mentions.$.type': {
    type: String,
    optional: true,
  },
  'mentions.$.slug': {
    type: String,
    optional: true,
  },
  'mentions.$.value': {
    type: String,
    optional: true,
  },
}, {
  tracker: Tracker,
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
  mentions: {
    type: Array,
    optional: true,
  },
  'mentions.$': {
    type: Object,
    optional: true,
  },
  'mentions.$.id': {
    type: String,
    optional: true,
  },
  'mentions.$.name': {
    type: String,
    optional: true,
  },
  'mentions.$.avatar': {
    type: String,
    optional: true,
  },
  'mentions.$.type': {
    type: String,
    optional: true,
  },
  'mentions.$.slug': {
    type: String,
    optional: true,
  },
  'mentions.$.value': {
    type: String,
    optional: true,
  },
}, {
  tracker: Tracker,
});

Comments.helpers({
  authorComments() {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.author) });
  },
  likesCount() {
    if (this.voteUp && this.voteUpCount) {
      return this.voteUpCount;
    }
    return 0;
  },
  dislikesCount() {
    if (this.voteDown && this.voteDownCount) {
      return this.voteDownCount;
    }
    return 0;
  },
  isAuthor() {
    return this.author === Meteor.userId();
  },
});

if (Meteor.isClient) {
  Comments.helpers({
    dateComments () {
      return moment.unix(this.created).format('YYYY-MM-DD HH:mm');
    },
    textMentions() {
      if (this.text) {
        let text = this.text;
        if (this.mentions) {
          Object.values(this.mentions).forEach((array) => {
            // text = text.replace(new RegExp(`@${array.value}`, 'g'), `<a href="${Router.path('detailList', {scope:array.type,_id:array.id})}" class="positive">@${array.value}</a>`);
            if (array.slug) {
              text = text.replace(new RegExp(`@?${array.slug}`, 'g'), `<a href="${Router.path('detailList', { scope: array.type, _id: array.id })}" class="positive">@${array.slug}</a>`);
            } else {
              text = text.replace(new RegExp(`@?${array.value}`, 'g'), `<a href="${Router.path('detailList', { scope: array.type, _id: array.id })}" class="positive">@${array.value}</a>`);
            }
          });
        }
        return text;
      }
      return undefined;
    },
    classArgval () {
      if (this.argval === 'up') {
        return 'item-balanced';
      } else if (this.argval === 'white') {
        return 'item-stable';
      } else if (this.argval === 'down') {
        return 'item-assertive';
      }
      return null;
    },
  });
}
