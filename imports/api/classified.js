import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

// schemas
import { baseSchema, geoSchema } from './schema.js';

// collection
import { Citoyens } from './citoyens.js';
import { Organizations } from './organizations.js';
import { Documents } from './documents.js';
import { Events } from './events.js';
import { Projects } from './projects.js';

import { nameToCollection } from './helpers.js';

export const Classified = new Mongo.Collection('classified', { idGeneration: 'MONGO' });

// SimpleSchema.debug = true;

export const SchemasClassifiedRest = new SimpleSchema([baseSchema, geoSchema, {
  section: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  type: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  subtype: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  contactInfo: {
    type: String,
  },
  price: {
    type: Number,
    optional: true,
  },
  parentType: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  parentId: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
}]);

if (Meteor.isClient) {
  window.Organizations = Organizations;
  window.Citoyens = Citoyens;
  window.Projects = Projects;
  window.Events = Events;
}

Classified.helpers({
  isVisibleFields (field) {
    /* if(this.isMe()){
        return true;
      }else{
        if(this.isPublicFields(field)){
          return true;
        }else{
          if(this.isFollowersMe() && this.isPrivateFields(field)){
            return true;
          }else{
            return false;
          }
        }
      } */
    return true;
  },
  documents () {
    return Documents.find({
      id: this._id._str,
      contentKey: 'profil',
    }, { sort: { created: -1 }, limit: 1 });
  },
  organizerClassified () {
    if (this.parentId && this.parentType && _.contains(['events', 'projects', 'organizations', 'citoyens'], this.parentType)) {
      // console.log(this.parentType);
      const collectionType = nameToCollection(this.parentType);
      return collectionType.findOne({
        _id: new Mongo.ObjectID(this.parentId),
      }, {
        fields: {
          name: 1,
          links: 1,
        },
      });
    }
    return undefined;
  },
  creatorProfile () {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.creator) });
  },
  isCreator () {
    return this.creator === Meteor.userId();
  },
  isFavorites (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return Citoyens.findOne({ _id: new Mongo.ObjectID(bothUserId) }).isFavorites('classified', this._id._str);
  },
  isAdmin (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    if (bothUserId && this.parentId && this.parentType && _.contains(['events', 'projects', 'organizations', 'citoyens'], this.parentType)) {
      if (this.parentType === 'citoyens') {
        return (this.parentId === bothUserId);
      }
      // console.log(this.organizerClassified());
      return this.organizerClassified() && this.organizerClassified().isAdmin(bothUserId);
    }
    return undefined;
  },
  scopeVar () {
    return 'classified';
  },
  scopeEdit () {
    return 'classifiedEdit';
  },
  listScope () {
    return 'listClassified';
  },
});

// }
