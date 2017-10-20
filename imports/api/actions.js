import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { moment } from 'meteor/momentjs:moment';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';

// schemas
import { baseSchema } from './schema.js';
import { Citoyens } from './citoyens.js';
import { Comments } from './comments.js';
import { queryLink, queryLinkToBeValidated, queryOptions } from './helpers.js';

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
  startDate: {
    type: Date,
    optional: true,
    custom () {
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
    custom () {
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
  parentId: {
    type: String,
  },
  parentType: {
    type: String,
    allowedValues: ['projects', 'organizations', 'events'],
  },
  /* status: {
    type: String,
    allowedValues: ['todo', 'disabled', 'done'],
  }, */
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
  creatorProfile () {
    return Citoyens.findOne({
      _id: new Mongo.ObjectID(this.creator),
    }, {
      fields: {
        name: 1,
        profilThumbImageUrl: 1,
      },
    });
  },
  isCreator () {
    return this.creator === Meteor.userId();
  },
  listMembersToBeValidated () {
    if (this.links && this.links.contributors) {
      const query = queryLinkToBeValidated(this.links.contributors);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  isContributors (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.isToBeValidated(bothUserId) && this.isIsInviting('contributors', bothUserId)));
  },
  listContributors (search) {
    if (this.links && this.links.contributors) {
      const query = queryLink(this.links.contributors, search);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  countContributors (search) {
    // return this.links && this.links.contributors && _.size(this.links.contributors);
    return this.listContributors(search) && this.listContributors(search).count();
  },
  isToBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].toBeValidated));
  },
  isIsInviting (scope, scopeId) {
    return !((this.links && this.links[scope] && this.links[scope][scopeId] && this.links[scope][scopeId].isInviting));
  },
  momentStartDate() {
    return moment(this.startDate).toDate();
  },
  momentEndDate() {
    return moment(this.endDate).toDate();
  },
  formatStartDate() {
    return moment(this.startDate).format('DD/MM/YYYY HH:mm');
  },
  formatEndDate() {
    return moment(this.endDate).format('DD/MM/YYYY HH:mm');
  },
  isEndDate () {
    const end = moment(this.endDate).toDate();
    // const now = moment().toDate();
    if (Meteor.isclient) {
      return Chronos.moment(end).isBefore(); // True
    }
    return moment(end).isBefore(); // True
  },
  isNotEndDate () {
    const end = moment(this.endDate).toDate();
    // const now = moment().toDate();
    if (Meteor.isclient) {
      return Chronos.moment().isBefore(end); // True
    }
    return moment().isBefore(end); // True
  },
  listComments () {
    // console.log('listComments');
    return Comments.find({
      contextId: this._id._str,
    }, { sort: { created: -1 } });
  },
  commentsCount () {
    if (this.commentCount) {
      return this.commentCount;
    }
    return 0;
  },
});
