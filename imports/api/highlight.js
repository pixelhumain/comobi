import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

// schemas
import { baseSchema, geoSchema } from './schema.js';
import { Citoyens } from './citoyens.js';
import { Organizations } from './organizations.js';
import { Projects } from './projects.js';
import { Events } from './events.js';
import { Poi } from './poi.js';
import { Gamesmobile } from './gamemobile.js';
import { queryLink, queryLinkToBeValidated } from './helpers.js';
import { nameToCollection } from './helpers.js';

export const Highlight = new Mongo.Collection('highlight', { idGeneration: 'MONGO' });

if (Meteor.isServer) {
  // Index

}

export const SchemasHighlightRest = new SimpleSchema({
  startDate: {
    type: Date,
    optional: true,
    custom() {
      if (this.field('endDate').value && !this.isSet && (!this.operator || (this.value === null || this.value === ''))) {
        return 'required';
      }
      const startDate = moment(this.value).toDate();
      const endDate = moment(this.field('endDate').value).toDate();
      if (moment(endDate).isBefore(startDate)) {
        return 'maxDateStart';
      }
    },
  },
  endDate: {
    type: Date,
    optional: true,
    custom() {
      if (this.field('startDate').value && !this.isSet && (!this.operator || (this.value === null || this.value === ''))) {
        return 'required';
      }
      const startDate = moment(this.field('startDate').value).toDate();
      const endDate = moment(this.value).toDate();
      if (moment(endDate).isBefore(startDate)) {
        return 'minDateEnd';
      }
    },
  },
  localityId: {
    type: String,
  },
  parentId: {
    type: String,
  },
  parentType: {
    type: String,
    allowedValues: ['projects', 'organizations', 'events', 'gamesmobile'],
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        this.unset();
      }
    },
  },
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true,
  },
});

Highlight.attachSchema(SchemasHighlightRest);

if (Meteor.isClient) {
    window.Organizations = Organizations;
    window.Projects = Projects;
    window.Events = Events;
    window.Gamesmobile = Gamesmobile;
}

Highlight.helpers({
  parentHighlight() {
      if (this.parentId && this.parentType && _.contains(['projects', 'organizations', 'events', 'gamesmobile'], this.parentType)) {
      // console.log(this.parentType);
      const collectionType = nameToCollection(this.parentType);
      return collectionType.findOne({
        _id: new Mongo.ObjectID(this.parentId),
      }, {
        fields: {
          link: 0,
        },
      });
    }
    return undefined;
  },
});
