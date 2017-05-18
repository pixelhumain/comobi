import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

export const News = new Meteor.Collection("news", {idGeneration : 'MONGO'});

if(Meteor.isServer){
//Index
News.rawCollection().createIndex(
    { 'target.id' : 1},
    { name: 'target_id', partialFilterExpression: { 'target.id': { $exists: true } }, background: true }
  , (e) => {
    if(e){
      console.log(e)
    }
});

News.rawCollection().createIndex(
      { 'mentions.id' : 1},
      { name: 'mentions_id', partialFilterExpression: { 'mentions.id': { $exists: true } }, background: true }
    , (e) => {
      if(e){
        console.log(e)
      }
});

News.rawCollection().createIndex(
        { 'target.id' : 1, 'scope.type': 1},
        { name: 'target_id_scope', partialFilterExpression: { 'target.id': { $exists: true }, 'scope.type': { $exists: true }}, background: true }
      , (e) => {
        if(e){
          console.log(e)
        }
});

News.rawCollection().createIndex(
          { 'author' : 1},
          { name: 'author_id', partialFilterExpression: { author: { $exists: true }}, background: true }
        , (e) => {
          if(e){
            console.log(e)
          }
});

News.rawCollection().createIndex(
        { 'author' : 1, 'target.id': 1},
        { name: 'author_target_id', partialFilterExpression: { author: { $exists: true }, 'target.id': { $exists: true }}, background: true }
      , (e) => {
        if(e){
          console.log(e)
        }
});

News.rawCollection().createIndex(
    { author: 1, targetIsAuthor: 1, type: 1, 'scope.type' : 1 },
    { name: 'author_targetIsAuthor_exists', partialFilterExpression: { author: { $exists: true },type: { $exists: true },'scope.type': { $exists: true },targetIsAuthor: { $exists: false } }, background: true }
  , (e) => {
    if(e){
      console.log(e)
    }
});
}

//citoyens
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
  "media.countImages" : {
    type: String,
    optional: true
  },
  "media.images" : {
    type: [String],
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
  },
  "mentions" : {
    type: [Object],
    optional: true
  },
  "mentions.$.id" : {
    type: String,
    optional: true
  },
  "mentions.$.name" : {
    type: String,
    optional: true
  },
  "mentions.$.avatar" : {
    type: String,
    optional: true
  },
  "mentions.$.type" : {
    type: String,
    optional: true
  },
  "mentions.$.value" : {
    type: String,
    optional: true
  },
});

  export const SchemasNewsRestBase = {};
  SchemasNewsRestBase.citoyens = new SimpleSchema([SchemasNewsRest,{
    scope: {
      type: String,
      autoValue: function() {
        if (this.isSet) {
          console.log(this.value);
          return this.value;
        } else {
          return 'restricted';
        }
      },
      optional: true
    },
  }]);
  SchemasNewsRestBase.projects = new SimpleSchema([SchemasNewsRest,{
    scope: {
      type: String,
      autoValue: function() {
        if (this.isSet) {
          console.log(this.value);
          return this.value;
        } else {
          return 'restricted';
        }
      },
      optional: true
    },
    targetIsAuthor: {
      type : String,
      defaultValue:'false',
      optional: true
    },
  }]);
  SchemasNewsRestBase.organizations = new SimpleSchema([SchemasNewsRest,{
    scope: {
      type: String,
      autoValue: function() {
        if (this.isSet) {
          console.log(this.value);
          return this.value;
        } else {
          return 'restricted';
        }
      },
      optional: true
    },
    targetIsAuthor: {
      type : String,
      defaultValue:'false',
      optional: true
    },
  }]);
  SchemasNewsRestBase.events = new SimpleSchema([SchemasNewsRest,{
    scope: {
      type: String,
      autoValue: function() {
        if (this.isSet) {
          console.log(this.value);
          return this.value;
        } else {
          return 'restricted';
        }
      },
      optional: true
    },
  }]);

  //collection
  if(Meteor.isClient){
    import { Documents } from './documents.js';
    import { Citoyens } from './citoyens.js';
    import { Organizations } from './organizations.js';
    import { Projects } from './projects.js';
    import { Events } from './events.js';
    import { Comments } from './comments.js';
    import { Router } from 'meteor/iron:router';
    import { nameToCollection } from './helpers.js';

    if(Meteor.isClient){
      window.Organizations = Organizations;
      window.Projects = Projects;
      window.Citoyens = Citoyens;
      window.Events = Events;
    }

    News.helpers({
      authorNews () {
        if(this.targetIsAuthor === 'true'){
          if(this.target && this.target.type && this.target.id){
            const collection = nameToCollection(this.target.type);
            return collection.findOne({_id:new Mongo.ObjectID(this.target.id)});
          }
        } else {
          return Citoyens.findOne({_id:new Mongo.ObjectID(this.author)});
        }
      },
      targetNews () {
        const queryOptions = {fields: {
          '_id': 1,
          'name': 1
        }};
          if(this.target && this.target.type && this.target.id){
            const collection = nameToCollection(this.target.type);
            return collection.findOne({_id:new Mongo.ObjectID(this.target.id)},queryOptions);
          }
      },
      objectNews () {
        const queryOptions = {fields: {
          '_id': 1,
          'name': 1
        }};
          if(this.object && this.object.type && this.object.id){
            const collection = nameToCollection(this.object.type);
            return collection.findOne({_id:new Mongo.ObjectID(this.object.id)},queryOptions);
          }
      },
      photoNewsAlbums () {
        if(this.media && this.media.images){
          let arrayId = this.media.images.map((_id) => {
            return new Mongo.ObjectID(_id)
          })
        return Documents.find({_id: { $in: arrayId }}).fetch();
      }
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
      textMentions () {
        if(this.text){
          let text = this.text;
        if(this.mentions){
        _.each(this.mentions, (array,key) => {
          text = text.replace(new RegExp(`@${array.value}`, 'g'), `<a href="${Router.path('detailList', {scope:array.type,_id:array.id})}" class="positive">@${array.value}</a>`);
        }, text);
        }
        return text;
      }
      },
      listComments () {
        console.log('listComments');
        return Comments.find({
          contextId: this._id._str
        },{sort: {"created": -1}});
      },
      commentsCount () {
        if (this.commentCount) {
          return this.commentCount;
        }
        return 0;
      }
    });
  }else{
    import { Citoyens } from './citoyens.js'
    import { Documents } from './documents.js';
    News.helpers({
      photoNewsAlbums () {
        if(this.media && this.media.images){
          let arrayId = this.media.images.map((_id) => {
            return new Mongo.ObjectID(_id)
          })
        return Documents.find({_id: { $in: arrayId }});
      }
      },
      authorNews () {
        return Citoyens.findOne({_id:new Mongo.ObjectID(this.author)});
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
      }
    });
  }
