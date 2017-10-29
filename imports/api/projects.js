import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

// schemas
import { baseSchema, blockBaseSchema, geoSchema, preferences } from './schema.js';

// collection
import { News } from './news.js';
import { Citoyens } from './citoyens.js';
import { Organizations } from './organizations.js';
import { Documents } from './documents.js';
import { Events } from './events.js';
import { Poi } from './poi.js';
import { Rooms } from './rooms.js';
import { ActivityStream } from './activitystream.js';
import { queryLink, queryLinkToBeValidated, queryOptions, nameToCollection } from './helpers.js';

export const Projects = new Mongo.Collection('projects', { idGeneration: 'MONGO' });

// SimpleSchema.debug = true;

export const SchemasProjectsRest = new SimpleSchema([baseSchema, geoSchema, {
  avancement: {
    type: String,
    optional: true,
  },
  startDate: {
    type: Date,
    optional: true,
  },
  endDate: {
    type: Date,
    optional: true,
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true,
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

export const BlockProjectsRest = {};
BlockProjectsRest.descriptions = new SimpleSchema([blockBaseSchema, baseSchema.pick(['shortDescription', 'description', 'tags', 'tags.$'])]);
BlockProjectsRest.info = new SimpleSchema([blockBaseSchema, baseSchema.pick(['name', 'url']), SchemasProjectsRest.pick(['avancement'])]);
BlockProjectsRest.network = new SimpleSchema([blockBaseSchema, {
  github: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
  },
  instagram: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
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
}]);
BlockProjectsRest.when = new SimpleSchema([blockBaseSchema, SchemasProjectsRest.pick(['startDate', 'endDate'])]);
BlockProjectsRest.locality = new SimpleSchema([blockBaseSchema, geoSchema]);
BlockProjectsRest.preferences = new SimpleSchema([blockBaseSchema, {
  preferences: {
    type: preferences,
    optional: true,
  },
}]);

if (Meteor.isClient) {
  window.Organizations = Organizations;
  window.Citoyens = Citoyens;
}

Projects.helpers({
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
  isPublicFields (field) {
    return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
  },
  isPrivateFields (field) {
    return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
  },
  documents () {
    return Documents.find({
      id: this._id._str,
      contentKey: 'profil',
    }, { sort: { created: -1 }, limit: 1 });
  },
  organizerProject () {
    if (this.parentId && this.parentType && _.contains(['organizations', 'citoyens'], this.parentType)) {
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
  rolesLinks (scope, scopeId) {
    let scopeCible = scope;
    if (scope === 'organizations') {
      scopeCible = 'memberOf';
    }
    return this.links && this.links[scopeCible] && this.links[scopeCible][scopeId] && this.links[scopeCible][scopeId].roles && this.links[scopeCible][scopeId].roles.join(',');
  },
  roles (scope, scopeId) {
    let scopeCible = scope;
    if (scope === 'organizations') {
      scopeCible = 'memberOf';
    }
    return this.links && this.links[scopeCible] && this.links[scopeCible][scopeId] && this.links[scopeCible][scopeId].roles && this.links[scopeCible][scopeId].roles.join(',');
  },
  creatorProfile () {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.creator) });
  },
  isCreator () {
    return this.creator === Meteor.userId();
  },
  isFavorites (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return Citoyens.findOne({ _id: new Mongo.ObjectID(bothUserId) }).isFavorites('projects', this._id._str);
  },
  isScopeMe () {
    return this.isContributors();
  },
  isScope (scope, scopeId) {
    return !!((this.links && this.links[scope] && this.links[scope][scopeId] && this.links[scope][scopeId].type && this.isIsInviting(scope, scopeId)));
  },
  isIsInviting (scope, scopeId) {
    return !((this.links && this.links[scope] && this.links[scope][scopeId] && this.links[scope][scopeId].isInviting));
  },
  isInviting (scope, scopeId) {
    return !!((this.links && this.links[scope] && this.links[scope][scopeId] && this.links[scope][scopeId].isInviting));
  },
  InvitingUser (scope, scopeId) {
    return this.links && this.links[scope] && this.links[scope][scopeId];
  },
  isAdmin (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    if (bothUserId && this.parentId && this.parentType && _.contains(['organizations'], this.parentType)) {
      // console.log(this.organizerProject());
      // console.log(`${this.parentType}:${this.parentId}`);
      if (this.organizerProject() && this.organizerProject().isAdmin(bothUserId)) {
        return true;
      }
    }
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].isAdmin && this.isToBeValidated(bothUserId) && this.isIsInviting('contributors', bothUserId)));
  },
  isToBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].toBeValidated));
  },
  toBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].toBeValidated));
  },
  toBeisInviting (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].isInviting));
  },
  listMembersToBeValidated () {
    if (this.links && this.links.contributors) {
      const query = queryLinkToBeValidated(this.links.contributors);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  scopeVar () {
    return 'projects';
  },
  scopeEdit () {
    return 'projectsEdit';
  },
  listScope () {
    return 'listProjects';
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
  isStart () {
    const start = moment(this.startDate).toDate();
    const now = moment().toDate();
    return moment(start).isBefore(now); // True
  },
  countContributors (search) {
    // return this.links && this.links.contributors && _.size(this.links.contributors);
    return this.listContributors(search) && this.listContributors(search).count();
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
  listEventsCreator () {
    const query = {};
    query.organizerId = this._id._str;
    queryOptions.fields.organizerId = 1;
    queryOptions.fields.parentId = 1;
    queryOptions.fields.startDate = 1;
    queryOptions.fields.startDate = 1;
    queryOptions.fields.geo = 1;
    return Events.find(query, queryOptions);
  },
  countEventsCreator () {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listEventsCreator() && this.listEventsCreator().count();
  },
  listPoiCreator () {
    const query = {};
    query.parentId = this._id._str;
    return Poi.find(query);
  },
  countPoiCreator () {
    return this.listPoiCreator() && this.listPoiCreator().count();
  },
  listRooms (search) {
    if (Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).isScope(this.scopeVar(), this._id._str)) {
      const query = {};

      if (this.isAdmin()) {
        if (Meteor.isClient && search) {
          query.parentId = this._id._str;
          query.name = { $regex: search, $options: 'i' };
          query.status = 'open';
        } else {
          query.parentId = this._id._str;
          query.status = 'open';
        }
      } else {
        query.$or = [];
        const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).funcRoles(this.scopeVar(), this._id._str) ? Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).funcRoles(this.scopeVar(), this._id._str).split(',') : null;
        if (roles) {
          if (Meteor.isClient && search) {
            query.$or.push({ parentId: this._id._str, name: { $regex: search, $options: 'i' }, status: 'open', roles: { $exists: true, $in: roles } });
          } else {
            query.$or.push({ parentId: this._id._str, status: 'open', roles: { $exists: true, $in: roles } });
          }
        }
        if (Meteor.isClient && search) {
          query.$or.push({ parentId: this._id._str, name: { $regex: search, $options: 'i' }, status: 'open', roles: { $exists: false } });
        } else {
          query.$or.push({ parentId: this._id._str, status: 'open', roles: { $exists: false } });
        }
      }

      queryOptions.fields.parentId = 1;
      queryOptions.fields.parentType = 1;
      queryOptions.fields.status = 1;
      queryOptions.fields.roles = 1;
      return Rooms.find(query, queryOptions);
    }
  },
  detailRooms (roomId) {
    if (Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).isScope(this.scopeVar(), this._id._str)) {
      const query = {};
      if (this.isAdmin()) {
        query._id = new Mongo.ObjectID(roomId);
        query.status = 'open';
      } else {
        query.$or = [];
        const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).funcRoles(this.scopeVar(), this._id._str) ? Citoyens.findOne({ _id: new Mongo.ObjectID(Meteor.userId()) }).funcRoles(this.scopeVar(), this._id._str).split(',') : null;
        if (roles) {
          query.$or.push({ _id: new Mongo.ObjectID(roomId), status: 'open', roles: { $exists: true, $in: roles } });
        }
        query.$or.push({ _id: new Mongo.ObjectID(roomId), status: 'open', roles: { $exists: false } });
      }
      return Rooms.find(query);
    }
  },
  countRooms (search) {
    return this.listRooms(search) && this.listRooms(search).count();
  },
  room (roomId) {
    return Rooms.findOne({ _id: new Mongo.ObjectID(Router.current().params.roomId) });
  },
  listNotifications (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return ActivityStream.api.isUnseen(bothUserId, this._id._str);
  },
  listNotificationsAsk (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return ActivityStream.api.isUnseenAsk(bothUserId, this._id._str);
  },
  countPopMap () {
    return this.links && this.links.contributors && _.size(this.links.contributors);
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
    if (this.isContributors(bothUserId)) {
      scopeTypeArray.push('private');
    }
    query.$or.push({ 'target.id': targetId, 'scope.type': { $in: scopeTypeArray } });
    query.$or.push({ 'mentions.id': targetId, 'scope.type': { $in: scopeTypeArray } });
    if (bothUserId) {
      // query['$or'].push({'author':bothUserId});
    }
    return News.find(query, options);
  },
  new () {
    return News.findOne({ _id: new Mongo.ObjectID(Router.current().params.newsId) });
  },
});
