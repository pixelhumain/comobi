import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

export const News = new Meteor.Collection("news", {idGeneration : 'MONGO'});

export const SchemasNewsRest =   new SimpleSchema({
  text : {
    type : String
  },
  parentId : {
    type: String
  },
  parentType : {
    type: String
  },
  tags : {
    type: [String],
    optional: true
  },
  media : {
    type: Object,
    optional: true
  },
  "media.type" : {
    type: String,
    optional: true
  },
  "media.content" : {
    type: Object,
    optional: true
  },
  "media.content.type" : {
    type: String,
    optional: true
  },
  "media.content.image" : {
    type: String,
    optional: true
  },
  "media.content.imageId" : {
    type: String,
    optional: true
  },
  "media.content.imageSize" : {
    type: String,
    optional: true
  },
  "media.content.videoLink" : {
    type: String,
    optional: true
  },
  "media.content.url" : {
    type: String,
    optional: true
  }
});


export const SchemasNews =   new SimpleSchema({
  text : {
    type : String,
    optional: true
  },
  tags : {
    type: [String],
    optional: true
  },
  media : {
    type: Object,
    optional: true
  },
  "media.type" : {
    type: String,
    optional: true
  },
  "media.content" : {
    type: Object,
    optional: true
  },
  "media.content.type" : {
    type: String,
    optional: true
  },
  "media.content.image" : {
    type: String,
    optional: true
  },
  "media.content.imageId" : {
    type: String,
    optional: true
  },
  "media.content.imageSize" : {
    type: String,
    optional: true
  },
  "media.content.videoLink" : {
    type: String,
    optional: true
  },
  "media.content.url" : {
    type: String,
    optional: true
  }
});

Meteor.startup(function() {
  //this.Schemas.News.i18n("schemas.news");
  News.attachSchema(SchemasNews);
});

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


if(Meteor.isClient){

  //collection
  import { Photosimg } from './client/photosimg.js'
  import { Citoyens } from './citoyens.js'

News.helpers({
  authorNews: function () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(this.author)});
  },
  photoNews: function () {
    if(this.media && this.media.content && this.media.content.imageId){
    return Photosimg.find({_id:this.media.content.imageId});
  }
  },
  likesCount : function () {
    if (this.voteUp && this.voteUpCount) {
      return this.voteUpCount;
    }
    return 0;
  },
  dislikesCount : function () {
    if (this.voteDown && this.voteDownCount) {
      return this.voteDownCount;
    }
    return 0;
  },
  isAuthor () {
    return this.author === Meteor.userId();
  }
});
}
