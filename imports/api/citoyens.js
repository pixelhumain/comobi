import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

// schemas
import { baseSchema, blockBaseSchema, geoSchema, preferencesSelect } from './schema.js';

import { News } from './news.js';
import { Events } from './events.js';
import { Projects } from './projects.js';
import { Poi } from './poi.js';
import { Classified } from './classified.js';
import { Organizations } from './organizations.js';
import { Documents } from './documents.js';
import { ActivityStream } from './activitystream.js';
import { queryLink, queryOptions, nameToCollection } from './helpers.js';

// Person
export const Citoyens = new Meteor.Collection('citoyens', { idGeneration: 'MONGO' });

const baseSchemaCitoyens = baseSchema.pick(['name', 'shortDescription', 'description', 'url', 'tags', 'tags.$']);

const updateSchemaCitoyens = new SimpleSchema({
  username: {
    type: String,
    custom () {
      if (Meteor.isClient && this.isSet) {
        Meteor.call('checkUsername', this.value, function (error, result) {
          // console.log(result);
          if (!result) {
            updateSchemaCitoyens.namedContext('editBlockCitoyen').addInvalidKeys([{ name: 'username', type: 'notUnique' }]);
          }
        });
      }
    },
  },
  email: {
    type: String,
    unique: true,
  },
  fixe: {
    type: String,
    optional: true,
  },
  mobile: {
    type: String,
    optional: true,
  },
  fax: {
    type: String,
    optional: true,
  },
  birthDate: {
    type: Date,
    optional: true,
  },
  github: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  telegram: {
    type: String,
    optional: true,
  },
  skype: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  gpplus: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  twitter: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  facebook: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
});


export const SchemasCitoyensRest = new SimpleSchema([baseSchemaCitoyens, updateSchemaCitoyens, geoSchema, {
  preferences: {
    type: Object,
    optional: true,
  },
  'preferences.isOpenData': {
    type: Boolean,
  },
}]);

export const BlockCitoyensRest = {};
BlockCitoyensRest.descriptions = new SimpleSchema([blockBaseSchema, baseSchema.pick(['shortDescription', 'description', 'tags', 'tags.$'])]);
BlockCitoyensRest.info = new SimpleSchema([blockBaseSchema, baseSchema.pick(['name', 'url']), updateSchemaCitoyens.pick(['email', 'fixe', 'mobile', 'fax', 'birthDate']), {
  username: {
    type: String,
    custom () {
      if (Meteor.isClient && this.isSet) {
        Meteor.call('checkUsername', this.value, function (error, result) {
          // console.log(result);
          if (!result) {
            BlockCitoyensRest.info.namedContext('editBlockCitoyen').addInvalidKeys([{ name: 'username', type: 'usernameNotUnique' }]);
          }
        });
      }
    },
  },
}]);
BlockCitoyensRest.network = new SimpleSchema([blockBaseSchema, updateSchemaCitoyens.pick(['github', 'telegram', 'skype', 'gpplus', 'twitter', 'facebook'])]);
BlockCitoyensRest.locality = new SimpleSchema([blockBaseSchema, geoSchema]);
BlockCitoyensRest.preferences = new SimpleSchema([blockBaseSchema, {
  preferences: {
    type: Object,
    optional: true,
  },
  'preferences.email': {
    type: String,
    allowedValues: preferencesSelect,
    optional: true,
  },
  'preferences.locality': {
    type: String,
    allowedValues: preferencesSelect,
    optional: true,
  },
  'preferences.phone': {
    type: String,
    allowedValues: preferencesSelect,
    optional: true,
  },
  'preferences.directory': {
    type: String,
    allowedValues: preferencesSelect,
    optional: true,
  },
  'preferences.birthDate': {
    type: String,
    allowedValues: preferencesSelect,
    optional: true,
  },
  'preferences.isOpenData': {
    type: Boolean,
    optional: true,
  },
}]);

// type : person / follow
// invitedUserName
// invitedUserEmail
export const SchemasFollowRest = new SimpleSchema({
  invitedUserName: {
    type: String,
  },
  invitedUserEmail: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
});

export const SchemasInviteAttendeesEventRest = new SimpleSchema({
  invitedUserName: {
    type: String,
  },
  invitedUserEmail: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  eventId: {
    type: String,
  },
});


if (Meteor.isClient) {
  window.Organizations = Organizations;
  window.Citoyens = Citoyens;
  window.Projects = Projects;
  window.Events = Events;
  window.Poi = Poi;
  window.Classified = Classified;
}

Citoyens.helpers({
  isVisibleFields (field) {
    if (this.isMe()) {
      return true;
    }
    if (this.isPublicFields(field)) {
      return true;
    }
    if (this.isFollowersMe() && this.isPrivateFields(field)) {
      return true;
    }
    return false;
  },
  isPublicFields (field) {
    return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
  },
  isPrivateFields (field) {
    return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
  },
  formatBirthDate() {
    return moment(this.birthDate).format('DD/MM/YYYY');
  },
  documents () {
    return Documents.find({
      id: this._id._str,
      contentKey: 'profil',
    }, { sort: { created: -1 }, limit: 1 });
  },
  isFavorites (scope, scopeId) {
    return !!((this.collections && this.collections.favorites && this.collections.favorites[scope] && this.collections.favorites[scope][scopeId]));
  },
  isMe () {
    return this._id._str === Meteor.userId();
  },
  isAdmin () {
    return this._id._str === Meteor.userId();
  },
  isFollows (followId) {
    return !!((this.links && this.links.follows && this.links.follows[followId]));
  },
  isFollowsMe () {
    return !!((this.links && this.links.follows && this.links.follows[Meteor.userId()]));
  },
  listFollows (search) {
    if (this.links && this.links.follows) {
      const query = queryLink(this.links.follows, search);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  countFollows (search) {
    // return this.links && this.links.follows && _.size(this.links.follows);
    return this.listFollows(search) && this.listFollows(search).count();
  },
  isFollowers (followId) {
    return !!((this.links && this.links.followers && this.links.followers[followId]));
  },
  isFollowersMe () {
    return !!((this.links && this.links.followers && this.links.followers[Meteor.userId()]));
  },
  listFollowers (search) {
    if (this.links && this.links.followers) {
      const query = queryLink(this.links.followers, search);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  countFollowers (search) {
    // return this.links && this.links.followers && _.size(this.links.followers);
    return this.listFollowers(search) && this.listFollowers(search).count();
  },
  listMemberOf (search, selectorga) {
    if (this.links && this.links.memberOf) {
      const query = queryLink(this.links.memberOf, search, selectorga);
      return Organizations.find(query, queryOptions);
    }
    return false;
  },
  countMemberOf (search, selectorga) {
    return this.listMemberOf(search, selectorga) && this.listMemberOf(search, selectorga).count();
  },
  listEvents (search) {
    if (this.links && this.links.events) {
      const query = queryLink(this.links.events, search);
      return Events.find(query, queryOptions);
    }
    return false;
  },
  countEvents (search) {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listEvents(search) && this.listEvents(search).count();
  },
  listProjects (search) {
    if (this.links && this.links.projects) {
      const query = queryLink(this.links.projects, search);
      return Projects.find(query, queryOptions);
    }
    return false;
  },
  countProjects (search) {
    // return this.links && this.links.projects && _.size(this.links.projects);
    return this.listProjects(search) && this.listProjects(search).count();
  },
  // Citoyens.findOne().listCollections('favorites','projects',search)
  listCollections (type, collections, search) {
    if (this.collections && this.collections[type] && this.collections[type][collections]) {
      const query = queryLink(this.collections[type][collections], search);
      const collection = nameToCollection(collections);
      return collection.find(query, queryOptions);
    }
    return false;
  },
  countCollections (type, collections, search) {
    return this.listCollections(type, collections, search) && this.listCollections(type, collections, search).count();
  },
  listProjectsCreator () {
    const query = {};
    // query['creator'] = this._id._str;
    query[`links.contributors.${this._id._str}.isAdmin`] = true;
    query[`links.contributors.${this._id._str}.toBeValidated`] = { $exists: false };
    return Projects.find(query, queryOptions);
  },
  countProjectsCreator () {
    return this.listProjectsCreator() && this.listProjectsCreator().count();
  },
  listPoiCreator () {
    const query = {};
    query.parentId = this._id._str
    // query[`links.contributors.${this._id._str}.isAdmin`] = true;
    // query[`links.contributors.${this._id._str}.toBeValidated`] = {$exists: false};
    return Poi.find(query);
  },
  countPoiCreator () {
    return this.listPoiCreator() && this.listPoiCreator().count();
  },
  listEventsCreator () {
    const query = {};
    query.organizerId = this._id._str;
    // query[`links.organizer.${this._id._str}`] = {$exist:1};
    queryOptions.fields.organizerId = 1;
    return Events.find(query, queryOptions);
  },
  countEventsCreator () {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listEventsCreator() && this.listEventsCreator().count();
  },
  listOrganizationsCreator () {
    const query = {};
    // query['creator'] = this._id._str;
    query[`links.members.${this._id._str}.isAdmin`] = true;
    query[`links.members.${this._id._str}.toBeValidated`] = { $exists: false };
    return Organizations.find(query, queryOptions);
  },
  countOrganizationsCreator () {
    return this.listOrganizationsCreator() && this.listOrganizationsCreator().count();
  },
  listNotifications () {
    return ActivityStream.api.isUnread(this._id._str);
  },
  listNotificationsAsk () {
    return ActivityStream.api.isUnreadAsk(this._id._str);
  },
  scopeVar () {
    return 'citoyens';
  },
  scopeEdit () {
    return 'citoyensEdit';
  },
  listScope () {
    return 'listCitoyens';
  },
  newsJournal (target, userId, limit) {
    const query = {};
    const options = {};
    options.sort = { created: -1 };
    query.$or = [];
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    const targetId = (typeof target !== 'undefined') ? target : Router.current().params._id;
    if (Meteor.isClient) {
      // const bothLimit = Session.get('limit');
    } else if (typeof limit !== 'undefined') {
      options.limit = limit;
    }
    const scopeTypeArray = ['public', 'restricted'];
    if (bothUserId === targetId) {
      // scopeTypeArray.push('private');
      query.$or.push({ author: targetId, targetIsAuthor: { $exists: false }, type: 'news' });
      query.$or.push({ 'target.id': targetId });
      // query['$or'].push({'mentions.id':targetId,'scope.type':{$in:scopeTypeArray}});
    } else {
      query.$or.push({ author: targetId, targetIsAuthor: { $exists: false }, type: 'news', 'scope.type': { $in: scopeTypeArray } });
      query.$or.push({ 'target.id': targetId, 'scope.type': { $in: scopeTypeArray } });
      // query['$or'].push({'mentions.id':targetId,'scope.type':{$in:scopeTypeArray}});
    }
    if (bothUserId) {
      query.$or.push({ author: bothUserId, 'target.id': targetId });
    }
    return News.find(query, options);
  },
  newsActus (userId, limit) {
    const query = {};
    const options = {};
    options.sort = { created: -1 };
    query.$or = [];
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    if (Meteor.isClient) {
      // const bothLimit = Session.get('limit');
    } else if (typeof limit !== 'undefined') {
      options.limit = limit;
    }

    let projectsArray;
    let eventsArray;
    let memberOfArray = [];

    // projects
    if (this.links && this.links.projects) {
      projectsArray = _.map(this.links.projects, (a, k) => k);
    }
    // events
    if (this.links && this.links.events) {
      eventsArray = _.map(this.links.events, (a, k) => k);
    }
    // memberOf
    if (this.links && this.links.memberOf) {
      memberOfArray = _.map(this.links.memberOf, (a, k) => k);
    }

    const arrayIds = _.union(projectsArray, eventsArray, memberOfArray);
    arrayIds.push(bothUserId);
    query.$or.push({ author: bothUserId });
    query.$or.push({ 'target.id': { $in: arrayIds } });
    query.$or.push({ 'mentions.id': { $in: arrayIds } });
    query.$or.push({ sharedBy: bothUserId });

    // follows
    if (this.links && this.links.follows) {
      const followsArray = _.map(this.links.follows, (a, k) => k);
      query.$or.push({ 'target.id': { $in: followsArray }, 'scope.type': { $in: ['public', 'restricted'] } });
    }
    return News.find(query, options);
  },
  new () {
    // console.log(News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)}));
    return Router.current().params.newsId && News.findOne({ _id: new Mongo.ObjectID(Router.current().params.newsId) });
  },
});
