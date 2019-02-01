import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { Router } from 'meteor/iron:router';

// schemas
import { baseSchema, blockBaseSchema, geoSchema, preferences } from './schema.js';

// collection
import { Lists } from './lists.js';
import { News } from './news.js';
import { Citoyens } from './citoyens.js';
import { Documents } from './documents.js';
import { Events } from './events.js';
import { Projects } from './projects.js';
import { Poi } from './poi.js';
import { Rooms } from './rooms.js';
import { ActivityStream } from './activitystream.js';
import { queryLink, queryLinkType, arrayLinkParent, queryLinkToBeValidated, searchQuery, queryOptions } from './helpers.js';

export const Organizations = new Mongo.Collection('organizations', { idGeneration: 'MONGO' });

// SimpleSchema.debug = true;

export const SchemasOrganizationsRest = new SimpleSchema([baseSchema, geoSchema, {
  type: {
    type: String,
    autoform: {
      type: 'select',
      options () {
        if (Meteor.isClient) {
          const listSelect = Lists.findOne({ name: 'organisationTypes' });
          if (listSelect && listSelect.list) {
            return _.map(listSelect.list, function (value, key) {
              return { label: value, value: key };
            });
          }
        }
        return undefined;
      },
    },
  },
  role: {
    type: String,
    min: 1,
    denyUpdate: true,
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
}]);

export const BlockOrganizationsRest = {};
BlockOrganizationsRest.descriptions = new SimpleSchema([blockBaseSchema, baseSchema.pick(['shortDescription', 'description', 'tags', 'tags.$'])]);
BlockOrganizationsRest.info = new SimpleSchema([blockBaseSchema, baseSchema.pick(['name', 'url']), SchemasOrganizationsRest.pick(['type', 'email', 'fixe', 'mobile', 'fax'])]);
BlockOrganizationsRest.network = new SimpleSchema([blockBaseSchema, {
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
BlockOrganizationsRest.locality = new SimpleSchema([blockBaseSchema, geoSchema]);
BlockOrganizationsRest.preferences = new SimpleSchema([blockBaseSchema, {
  preferences: {
    type: preferences,
    optional: true,
  },
}]);

Organizations.helpers({
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
  rolesLinks (scope, scopeId) {
    let scopeCible = scope;
    if (scope === 'organizations') {
      scopeCible = 'memberOf';
    }
    return this.links && this.links[scopeCible] && this.links[scopeCible][scopeId] && this.links[scopeCible][scopeId].roles && this.links[scopeCible][scopeId].roles.join(',');
  },
  roles(scope, scopeId) {
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
    return Citoyens.findOne({ _id: new Mongo.ObjectID(bothUserId) }).isFavorites('organizations', this._id._str);
  },
  isScopeMe () {
    return this.isMembers();
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
    return !!((this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].isAdmin && this.isToBeValidated(bothUserId) && this.isIsInviting('members', bothUserId)));
  },
  isToBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !((this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].toBeValidated));
  },
  toBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].toBeValidated));
  },
  toBeisInviting (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].isInviting));
  },
  listMembersToBeValidated () {
    if (this.links && this.links.members) {
      const query = queryLinkToBeValidated(this.links.members);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  scopeVar () {
    return 'organizations';
  },
  scopeEdit () {
    return 'organizationsEdit';
  },
  listScope () {
    return 'listOrganizations';
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
  isMembers (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.members && this.links.members[bothUserId] && this.isToBeValidated(bothUserId) && this.isIsInviting('members', bothUserId)));
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
  listMembers (search) {
    if (this.links && this.links.members) {
      const query = queryLinkType(this.links.members, search, 'citoyens');
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  countMembers (search) {
    /* if(this.links && this.links.members){
      let members = arrayLinkType(this.links.members,'citoyens');
      return members && _.size(members);
      } */
    return this.listMembers(search) && this.listMembers(search).count();
  },
  listMembersOrganizations (search, selectorga) {
    if (this.links && this.links.members) {
      const query = queryLinkType(this.links.members, search, 'organizations', selectorga);
      return Organizations.find(query, queryOptions);
    }
    return false;
  },
  countMembersOrganizations (search, selectorga) {
    /* if(this.links && this.links.members){
      let members = arrayLinkType(this.links.members,'organizations');
      return members && _.size(members);} */
    return this.listMembersOrganizations(search, selectorga) && this.listMembersOrganizations(search, selectorga).count();
  },
  listProjectsCreator () {
    if (this.links && this.links.projects) {
      const projectIds = arrayLinkParent(this.links.projects, 'projects');
      const query = {};
      query._id = {
        $in: projectIds,
      };
      // queryOptions.fields.parentId = 1;
      return Projects.find(query, queryOptions);
    }
  },
  countProjectsCreator () {
    return this.listProjectsCreator() && this.listProjectsCreator().count();
  },
  listPoiCreator () {
    const query = {};
    query[`parent.${this._id._str}`] = {
      $exists: true
    };
    return Poi.find(query);
  },
  countPoiCreator () {
    return this.listPoiCreator() && this.listPoiCreator().count();
  },
  listEventsCreator () {
    if (this.links && this.links.events) {
      const eventsIds = arrayLinkParent(this.links.events, 'events');
      const query = {};
      query._id = {
        $in: eventsIds,
      };
      queryOptions.fields.startDate = 1;
      queryOptions.fields.startDate = 1;
      queryOptions.fields.geo = 1;
      return Events.find(query, queryOptions);
    }
  },
  countEventsCreator () {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listEventsCreator() && this.listEventsCreator().count();
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
    return this.links && this.links.members && _.size(this.links.members);
  },
  typeValue () {
    const organisationTypes = Lists.findOne({ name: 'organisationTypes' });
    return this.type && organisationTypes && organisationTypes.list && organisationTypes.list[this.type];
  },
  listOrganisationTypes () {
    return Lists.find({ name: 'organisationTypes' });
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
    if (this.isMembers(bothUserId)) {
      scopeTypeArray.push('private');
      query.$or.push({ 'target.id': targetId, 'scope.type': { $in: scopeTypeArray } });
      query.$or.push({ 'mentions.id': targetId });
    } else {
      query.$or.push({ 'target.id': targetId, $or: [{ 'scope.type': { $in: scopeTypeArray } }, { author: bothUserId }] });
      query.$or.push({ 'mentions.id': targetId, 'scope.type': { $in: scopeTypeArray } });
    }
    return News.find(query, options);
  },
  new () {
    return News.findOne({ _id: new Mongo.ObjectID(Router.current().params.newsId) });
  },
});

// }
