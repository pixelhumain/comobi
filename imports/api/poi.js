import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { _ } from 'meteor/underscore';
import { Tracker } from 'meteor/tracker';

// schemas
import { baseSchema, blockBaseSchema, geoSchema } from './schema.js';

// collection
import { Citoyens } from './citoyens.js';
import { Organizations } from './organizations.js';
import { Documents } from './documents.js';
import { Events } from './events.js';
import { Projects } from './projects.js';
import { arrayOrganizerParent, isAdminArray, nameToCollection } from './helpers.js';

export const Poi = new Mongo.Collection('poi', { idGeneration: 'MONGO' });

// SimpleSchema.debug = true;

/* export const SchemasPoiRest = new SimpleSchema([baseSchema, geoSchema, {
  type: {
    type: String,
    autoform: {
      type: 'select',
    },
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
  urls: {
    type: Array,
    optional: true,
  },
  'urls.$': {
    type: String,
  },
}]); */

export const SchemasPoiRest = new SimpleSchema(baseSchema, {
  tracker: Tracker,
});
SchemasPoiRest.extend(geoSchema);
SchemasPoiRest.extend({
  type: {
    type: String,
    autoform: {
      type: 'select',
    },
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
  urls: {
    type: Array,
    optional: true,
  },
  'urls.$': {
    type: String,
  },
});

export const BlockPoiRest = {};
// BlockPoiRest.descriptions = new SimpleSchema([blockBaseSchema, baseSchema.pick('shortDescription', 'description', 'tags', 'tags.$)]');
BlockPoiRest.descriptions = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockPoiRest.descriptions.extend(baseSchema.pick('shortDescription', 'description', 'tags', 'tags.$'));

// BlockPoiRest.info = new SimpleSchema([blockBaseSchema, baseSchema.pick('name)]');
BlockPoiRest.info = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockPoiRest.info.extend(baseSchema.pick('name'));

// BlockPoiRest.locality = new SimpleSchema([blockBaseSchema, geoSchema]);
BlockPoiRest.locality = new SimpleSchema(blockBaseSchema, {
  tracker: Tracker,
});
BlockPoiRest.locality.extend(geoSchema);


if (Meteor.isClient) {
  window.Organizations = Organizations;
  window.Citoyens = Citoyens;
  window.Projects = Projects;
  window.Events = Events;
}

Poi.helpers({
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
  organizerPoi () {
    if (this.parent) {
      const childrenParent = arrayOrganizerParent(this.parent, ['events', 'projects', 'organizations', 'citoyens']);
      if (childrenParent) {
        return childrenParent;
      }
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
    return Citoyens.findOne({ _id: new Mongo.ObjectID(bothUserId) }).isFavorites('poi', this._id._str);
  },
  isAdmin (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();

    const citoyen = Citoyens.findOne({ _id: new Mongo.ObjectID(bothUserId) });
    const organizerPoi = this.organizerPoi();

    if (bothUserId && this.parent) {
      if (this.parent[bothUserId] && this.parent[bothUserId].type === 'citoyens') {
        return true;
      }
      // console.log(this.organizerPoi());
      return isAdminArray(organizerPoi, citoyen);
    }
    return undefined;
  },
  scopeVar () {
    return 'poi';
  },
  scopeEdit () {
    return 'poiEdit';
  },
  listScope () {
    return 'listPoi';
  },
});

// }
