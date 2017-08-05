import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

export const Projects = new Meteor.Collection('projects', { idGeneration: 'MONGO' });

// schemas
import { baseSchema, blockBaseSchema, geoSchema, avancements_SELECT, avancements_SELECT_LABEL, preferences } from './schema.js';

// collection
import { Lists } from './lists.js';

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

// if(Meteor.isClient){
// collection
import { News } from './news.js';
import { Citoyens } from './citoyens.js';
import { Organizations } from './organizations.js';
import { Documents } from './documents.js';
import { Events } from './events.js';
import { Poi } from './poi.js';
import { ActivityStream } from './activitystream.js';
import { queryLink, queryLinkType, arrayLinkType, queryLinkToBeValidated, arrayLinkToBeValidated, queryOptions, nameToCollection } from './helpers.js';

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
      console.log(this.parentType);
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
  isAdmin (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    if (bothUserId && this.parentId && this.parentType && _.contains(['organizations'], this.parentType)) {
      console.log(this.organizerProject());
      console.log(`${this.parentType}:${this.parentId}`);
      return this.organizerProject() && this.organizerProject().isAdmin(bothUserId);
    }
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].isAdmin && this.isToBeValidated(bothUserId)));
  },
  isToBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].toBeValidated));
  },
  toBeValidated (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.links.contributors[bothUserId].toBeValidated));
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
    return !!((this.links && this.links.contributors && this.links.contributors[bothUserId] && this.isToBeValidated(bothUserId)));
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
    return Events.find(query, queryOptions);
  },
  countEventsCreator () {
    // return this.links && this.links.events && _.size(this.links.events);
    return this.listEventsCreator() && this.listEventsCreator().count();
  },
  listPoiCreator () {
    const query = {};
    query.parentId = this._id._str;
    return Poi.find(query, queryOptions);
  },
  countPoiCreator () {
    return this.listPoiCreator() && this.listPoiCreator().count();
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
      const bothLimit = Session.get('limit');
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

// }
