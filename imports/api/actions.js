import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

// schemas
import { baseSchema } from './schema.js';

export const Actions = new Mongo.Collection('actions', { idGeneration: 'MONGO' });

/*
idParentRoom:59d64c0240bb4e2e4fdcd10b
name:test action
description:test action
startDate:2017-10-06T12:43:00+04:00
endDate:2017-10-28T12:43:00+04:00
status:todo
email:thomas.craipeau@gmail.com
idUserAuthor:55ed9107e41d75a41a558524
parentId:598ad7bc40bb4e3f11219447
parentType:organizations
key:action
collection:actions
*/

export const SchemasActionsRest = new SimpleSchema([baseSchema.pick(['name', 'description', 'tags', 'tags.$']), {
  idParentRoom: {
    type: String,
  },
  idUserAuthor: {
    type: String,
  },
  startDate: {
    type: Date,
    optional: true,
  },
  endDate: {
    type: Date,
    optional: true,
  },
  parentId: {
    type: String,
  },
  parentType: {
    type: String,
    allowedValues: ['projects', 'organizations', 'events'],
  },
  status: {
    type: String,
    allowedValues: ['todo', 'disabled', 'done'],
  },
  urls: {
    type: [String],
    optional: true,
  },
}]);

Actions.helpers({
  isVisibleFields (field) {
    return true;
  },
  isPublicFields (field) {
    return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
  },
  isPrivateFields (field) {
    return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
  },
  scopeVar () {
    return 'actions';
  },
  scopeEdit () {
    return 'actionsEdit';
  },
  listScope () {
    return 'listActions';
  },
});
