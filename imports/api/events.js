import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

// schemas
import { baseSchema, blockBaseSchema, geoSchema, preferences } from './schema.js';

// collection
import { Lists } from './lists.js';
import { Citoyens } from './citoyens.js';
import { Organizations } from './organizations.js';
import { Projects } from './projects.js';
import { Poi } from './poi.js';
// SimpleSchema.debug = true;

import { News } from './news.js';
import { Documents } from './documents.js';
import { ActivityStream } from './activitystream.js';
import { queryLink, queryOptions, nameToCollection } from './helpers.js';

export const Events = new Meteor.Collection('events', { idGeneration: 'MONGO' });


export const SchemasEventsRest = new SimpleSchema([baseSchema, geoSchema, {
  type: {
    type: String,
    autoform: {
      type: 'select',
      options () {
        if (Meteor.isClient) {
          const listSelect = Lists.findOne({ name: 'eventTypes' });
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
  allDay: {
    type: Boolean,
    defaultValue: false,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  email: {
    type: String,
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
  organizerId: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  organizerType: {
    type: String,
    autoform: {
      type: 'select',
    },
  },
  parentId: {
    type: String,
    optional: true,
    autoform: {
      type: 'select',
    },
  },
}]);

export const BlockEventsRest = {};
BlockEventsRest.descriptions = new SimpleSchema([blockBaseSchema, baseSchema.pick(['shortDescription', 'description', 'tags', 'tags.$'])]);
BlockEventsRest.info = new SimpleSchema([blockBaseSchema, baseSchema.pick(['name', 'url']), SchemasEventsRest.pick(['type'])]);
BlockEventsRest.network = new SimpleSchema([blockBaseSchema, {
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
BlockEventsRest.when = new SimpleSchema([blockBaseSchema, SchemasEventsRest.pick(['allDay', 'startDate', 'endDate'])]);
BlockEventsRest.locality = new SimpleSchema([blockBaseSchema, geoSchema]);
BlockEventsRest.preferences = new SimpleSchema([blockBaseSchema, {
  preferences: {
    type: preferences,
    optional: true,
  },
}]);

// if(Meteor.isClient){
// collection

if (Meteor.isClient) {
  window.Organizations = Organizations;
  window.Projects = Projects;
  window.Poi = Poi;
  window.Citoyens = Citoyens;
}

Events.helpers({
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
  organizerEvent () {
    if (this.organizerType && this.organizerId && _.contains(['events', 'projects', 'organizations', 'citoyens'], this.organizerType)) {
      const collectionType = nameToCollection(this.organizerType);
      return collectionType.findOne({
        _id: new Mongo.ObjectID(this.organizerId),
      }, {
        fields: {
          name: 1,
          links: 1,
        },
      });
    }
    return undefined;
  },
  documents () {
    return Documents.find({
      id: this._id._str,
      contentKey: 'profil',
    }, { sort: { created: -1 }, limit: 1 });
  },
  creatorProfile () {
    return Citoyens.findOne({ _id: new Mongo.ObjectID(this.creator) });
  },
  isCreator () {
    return this.creator === Meteor.userId();
  },
  isFavorites (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return Citoyens.findOne({ _id: new Mongo.ObjectID(bothUserId) }).isFavorites('events', this._id._str);
  },
  isAdmin (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    if (bothUserId && this.organizerId && this.organizerType && _.contains(['events', 'projects', 'organizations'], this.organizerType)) {
      // console.log(this.organizerEvent());
      if (this.organizerEvent() && this.organizerEvent().isAdmin(bothUserId)) {
        return true;
      }
    }
    return !!((this.links && this.links.attendees && this.links.attendees[bothUserId] && this.links.attendees[bothUserId].isAdmin));
  },
  scopeVar () {
    return 'events';
  },
  scopeEdit () {
    return 'eventsEdit';
  },
  listScope () {
    return 'listEvents';
  },
  isAttendees (userId) {
    const bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
    return !!((this.links && this.links.attendees && this.links.attendees[bothUserId]));
  },
  listAttendees (search) {
    if (this.links && this.links.attendees) {
      const query = queryLink(this.links.attendees, search);
      return Citoyens.find(query, queryOptions);
    }
    return false;
  },
  countAttendees () {
    return this.links && this.links.attendees && _.size(this.links.attendees);
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
    return this.links && this.links.attendees && _.size(this.links.attendees);
  },
  isStart () {
    const start = moment(this.startDate).toDate();
    const now = moment().toDate();
    return moment(start).isBefore(now); // True
  },
  typeValue () {
    return Lists.findOne({ name: 'eventTypes' }).list[this.type];
  },
  listEventTypes () {
    return Lists.find({ name: 'eventTypes' });
  },
  listPoiCreator () {
    const query = {};
    query.parentId = this._id._str;
    return Poi.find(query);
  },
  countPoiCreator () {
    return this.listPoiCreator() && this.listPoiCreator().count();
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
      // options.limit = bothLimit;
    } else if (typeof limit !== 'undefined') {
      options.limit = limit;
    }
    const scopeTypeArray = ['public', 'restricted'];
    if (this.isAdmin(bothUserId)) {
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
    return Router.current().params.newsId && News.findOne({ _id: new Mongo.ObjectID(Router.current().params.newsId) });
  },
});

// }
