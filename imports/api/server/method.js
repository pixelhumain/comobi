import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { HTTP } from 'meteor/http';
import { URL } from 'meteor/url';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Mongo } from 'meteor/mongo';
import { ValidEmail, IsValidEmail } from 'meteor/froatsnook:valid-email';
// collection et schemas
// import { NotificationHistory } from '../notification_history.js';
import { ActivityStream } from '../activitystream.js';
import { Citoyens, BlockCitoyensRest, SchemasCitoyensRest, SchemasInvitationsRest, SchemasFollowRest, SchemasInviteAttendeesEventRest } from '../citoyens.js';
import { News, SchemasNewsRest, SchemasNewsRestBase } from '../news.js';
import { Documents } from '../documents.js';
import { Cities } from '../cities.js';
import { Lists } from '../lists.js';
import { Events, SchemasEventsRest, BlockEventsRest } from '../events.js';
import { Organizations, SchemasOrganizationsRest, BlockOrganizationsRest } from '../organizations.js';
import { Projects, SchemasProjectsRest, BlockProjectsRest } from '../projects.js';
import { Poi, SchemasPoiRest, BlockPoiRest } from '../poi.js';
import { Classified, SchemasClassifiedRest } from '../classified.js';
import { Comments, SchemasCommentsRest, SchemasCommentsEditRest } from '../comments.js';
import { SchemasShareRest, SchemasRolesRest } from '../schema.js';
// DDA
import { Actions, SchemasActionsRest } from '../actions.js';
import { Resolutions } from '../resolutions.js';
import { Rooms, SchemasRoomsRest } from '../rooms.js';
import { Proposals, SchemasProposalsRest, BlockProposalsRest } from '../proposals.js';

// function api
import { apiCommunecter } from './api.js';

// helpers
import { encodeString, nameToCollection } from '../helpers.js';

global.Events = Events;
global.Organizations = Organizations;
global.Projects = Projects;
global.Poi = Poi;
global.Classified = Classified;
global.Citoyens = Citoyens;
global.Actions = Actions;
global.Resolutions = Resolutions;
global.Rooms = Rooms;
global.Proposals = Proposals;

const baseDocRetour = (docRetour, doc, scope) => {
  if (scope === 'block') {
    if (doc.typeElement === 'citoyens') {
      if (doc.block === 'descriptions') {
        docRetour.description = doc.description ? doc.description : '';
        docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
        docRetour.tags = doc.tags ? doc.tags : '';
      }
      if (doc.block === 'network') {
        docRetour.telegram = doc.telegram ? doc.telegram : '';
        docRetour.skype = doc.skype ? doc.skype : '';
        docRetour.github = doc.github ? doc.github : '';
        docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
        docRetour.twitter = doc.twitter ? doc.twitter : '';
        docRetour.facebook = doc.facebook ? doc.facebook : '';
      }
      if (doc.block === 'info') {
        docRetour.name = doc.name;
        docRetour.email = doc.email;
        docRetour.url = doc.url ? doc.url : '';
        docRetour.fixe = doc.fixe ? doc.fixe : '';
        docRetour.mobile = doc.mobile ? doc.mobile : '';
        docRetour.fax = doc.fax ? doc.fax : '';
        docRetour.birthDate = doc.birthDate ? moment(doc.birthDate).format() : '';
      }
      if (doc.block === 'preferences') {

      }
    } else if (doc.typeElement === 'events') {
      if (doc.block === 'descriptions') {
        docRetour.description = doc.description ? doc.description : '';
        docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
        docRetour.tags = doc.tags ? doc.tags : '';
      }
      if (doc.block === 'network') {
        docRetour.instagram = doc.instagram ? doc.instagram : '';
        docRetour.skype = doc.skype ? doc.skype : '';
        docRetour.github = doc.github ? doc.github : '';
        docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
        docRetour.twitter = doc.twitter ? doc.twitter : '';
        docRetour.facebook = doc.facebook ? doc.facebook : '';
      }
      if (doc.block === 'info') {
        docRetour.name = doc.name;
        docRetour.type = doc.type;
        docRetour.url = doc.url ? doc.url : '';
      }
      if (doc.block === 'when') {
        docRetour.allDay = doc.allDay;
        docRetour.startDate = moment(doc.startDate).format();
        docRetour.endDate = moment(doc.endDate).format();
      }
    } else if (doc.typeElement === 'projects') {
      if (doc.block === 'descriptions') {
        docRetour.description = doc.description ? doc.description : '';
        docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
        docRetour.tags = doc.tags ? doc.tags : '';
      }
      if (doc.block === 'network') {
        docRetour.instagram = doc.instagram ? doc.instagram : '';
        docRetour.skype = doc.skype ? doc.skype : '';
        docRetour.github = doc.github ? doc.github : '';
        docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
        docRetour.twitter = doc.twitter ? doc.twitter : '';
        docRetour.facebook = doc.facebook ? doc.facebook : '';
      }
      if (doc.block === 'info') {
        docRetour.name = doc.name;
        docRetour.avancement = doc.avancement ? doc.avancement : '';
        docRetour.url = doc.url ? doc.url : '';
      }
      if (doc.block === 'when') {
        docRetour.startDate = moment(doc.startDate).format();
        docRetour.endDate = moment(doc.endDate).format();
      }
    } else if (doc.typeElement === 'poi') {
      if (doc.block === 'descriptions') {
        docRetour.description = doc.description ? doc.description : '';
        docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
        docRetour.tags = doc.tags ? doc.tags : '';
      }
      if (doc.block === 'info') {
        docRetour.name = doc.name;
      }
    } else if (doc.typeElement === 'organizations') {
      if (doc.block === 'descriptions') {
        docRetour.description = doc.description ? doc.description : '';
        docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
        docRetour.tags = doc.tags ? doc.tags : '';
      }
      if (doc.block === 'network') {
        docRetour.instagram = doc.instagram ? doc.instagram : '';
        docRetour.skype = doc.skype ? doc.skype : '';
        docRetour.github = doc.github ? doc.github : '';
        docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
        docRetour.twitter = doc.twitter ? doc.twitter : '';
        docRetour.facebook = doc.facebook ? doc.facebook : '';
      }
      if (doc.block === 'info') {
        docRetour.name = doc.name;
        docRetour.type = doc.type;
        docRetour.email = doc.email ? doc.email : '';
        docRetour.url = doc.url ? doc.url : '';
        docRetour.fixe = doc.fixe ? doc.fixe : '';
        docRetour.mobile = doc.mobile ? doc.mobile : '';
        docRetour.fax = doc.fax ? doc.fax : '';
      }
    }
  } else if (scope === 'events') {
    docRetour.name = doc.name;
    // docRetour.description = doc.description ? doc.description : '';
    if (doc.description) {
      docRetour.description = doc.description;
    }
    if (doc.shortDescription) {
      docRetour.shortDescription = doc.shortDescription;
    }
    docRetour.type = doc.type;
    docRetour.allDay = doc.allDay;
    docRetour.startDate = moment(doc.startDate).format();
    docRetour.endDate = moment(doc.endDate).format();
    docRetour.organizerId = doc.organizerId;
    docRetour.organizerType = doc.organizerType;
    docRetour.tags = doc.tags ? doc.tags : '';
    if (doc.parentId) {
      docRetour.parentId = doc.parentId;
    }
    if (doc.preferences) {
      docRetour.preferences = doc.preferences;
    }
  } else if (scope === 'organizations') {
    docRetour.name = doc.name;
    docRetour.description = doc.description ? doc.description : '';
    docRetour.type = doc.type;
    docRetour.role = doc.role;
    docRetour.email = doc.email ? doc.email : '';
    docRetour.url = doc.url ? doc.url : '';
    docRetour.fixe = doc.fixe ? doc.fixe : '';
    docRetour.mobile = doc.mobile ? doc.mobile : '';
    docRetour.fax = doc.fax ? doc.fax : '';
    if (doc.preferences) {
      docRetour.preferences = doc.preferences;
    }
    docRetour.tags = doc.tags ? doc.tags : '';
  } else if (scope === 'projects') {
    docRetour.name = doc.name;
    docRetour.description = doc.description ? doc.description : '';
    docRetour.url = doc.url ? doc.url : '';
    docRetour.startDate = doc.startDate ? moment(doc.startDate).format() : '';
    docRetour.endDate = doc.endDate ? moment(doc.endDate).format() : '';
    docRetour.parentId = doc.parentId;
    docRetour.parentType = doc.parentType;
    if (doc.preferences) {
      docRetour.preferences = doc.preferences;
    }
    docRetour.tags = doc.tags ? doc.tags : '';
  } else if (scope === 'poi') {
    docRetour.name = doc.name;
    docRetour.description = doc.description ? doc.description : '';
    docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
    docRetour.urls = doc.urls ? doc.urls : '';
    docRetour.parentId = doc.parentId;
    docRetour.parentType = doc.parentType;
    docRetour.type = doc.type;
    docRetour.tags = doc.tags ? doc.tags : '';
  } else if (scope === 'classified') {
    docRetour.name = doc.name;
    docRetour.description = doc.description ? doc.description : '';
    docRetour.section = doc.section;
    docRetour.type = doc.type;
    docRetour.subtype = doc.subtype ? doc.subtype : '';
    docRetour.contactInfo = doc.contactInfo ? doc.contactInfo : '';
    docRetour.price = doc.price ? doc.price : '';
    docRetour.parentId = doc.parentId;
    docRetour.parentType = doc.parentType;
    docRetour.tags = doc.tags ? doc.tags : '';
  } else {
    if (doc.name) {
      docRetour.name = doc.name;
    }
    if (doc.description) {
      docRetour.description = doc.description;
    }
    if (doc.shortDescription) {
      docRetour.shortDescription = doc.shortDescription;
    }
    if (doc.startDate) {
      docRetour.startDate = moment(doc.startDate).format();
    }
    if (doc.endDate) {
      docRetour.endDate = moment(doc.endDate).format();
    }
    if (doc.allDay) {
      docRetour.allDay = doc.allDay;
    }
    if (doc.organizerId) {
      docRetour.organizerId = doc.organizerId;
    }
    if (doc.organizerType) {
      docRetour.organizerType = doc.organizerType;
    }
    if (doc.type) {
      docRetour.type = doc.type;
    }
    if (doc.role) {
      docRetour.role = doc.role;
    }
    if (doc.email) {
      docRetour.email = doc.email;
    }
    if (doc.url) {
      docRetour.url = doc.url;
    }
    if (doc.tags) {
      docRetour.tags = doc.tags;
    }
  }

  /* if(doc.preferences){
  docRetour.preferences = doc.preferences;
  } else {
    if(doc['preferences.isOpenData']){
      if(!docRetour.preferences){
        docRetour.preferences={};
      }
        docRetour.preferences['isOpenData'] = doc['preferences.isOpenData'];
    }
    if(doc['preferences.isOpenEdition']){
      if(!docRetour.preferences){
        docRetour.preferences={};
      }
        docRetour.preferences['isOpenEdition'] = doc['preferences.isOpenEdition'];
    }
  } */

  if (doc.block === 'locality') {
    docRetour.name = 'locality';
    docRetour.value = {};
    docRetour.value.unikey = `${doc.country}_${doc.city}-${doc.postalCode}`;
    docRetour.value.address = {};
    docRetour.value.address['@type'] = 'PostalAddress';
    docRetour.value.address.addressCountry = doc.country;
    docRetour.value.address.postalCode = doc.postalCode;
    docRetour.value.address.codeInsee = doc.city;
    docRetour.value.address.addressLocality = doc.cityName;
    docRetour.value.address.regionName = doc.regionName;
    docRetour.value.address.depName = doc.depName;
    if (doc.streetAddress) {
      docRetour.value.address.streetAddress = doc.streetAddress;
    }
    if (doc.geoPosLatitude && doc.geoPosLongitude) {
      docRetour.value.geo = {};
      docRetour.value.geo.latitude = doc.geoPosLatitude;
      docRetour.value.geo.longitude = doc.geoPosLongitude;
      docRetour.value.geo['@type'] = 'GeoCoordinates';
      docRetour.value.geoPosition = {};
      docRetour.value.geoPosition.type = 'Point';
      docRetour.value.geoPosition.coordinates = [parseFloat(doc.geoPosLongitude), parseFloat(doc.geoPosLatitude)];
    }
  } else {
    if (doc.country || doc.postalCode || doc.city || doc.cityName || doc.regionName || doc.depName || doc.streetAddress) {
      docRetour.address = {};
      docRetour.address['@type'] = 'PostalAddress';
      docRetour.address.addressCountry = doc.country;
      docRetour.address.postalCode = doc.postalCode;
      docRetour.address.codeInsee = doc.city;
      docRetour.address.addressLocality = doc.cityName;
      docRetour.address.regionName = doc.regionName;
      docRetour.address.depName = doc.depName;
      if (doc.streetAddress) {
        docRetour.address.streetAddress = doc.streetAddress;
      }
    }
    if (doc.geoPosLatitude && doc.geoPosLongitude) {
      docRetour.geo = {};
      docRetour.geo.latitude = doc.geoPosLatitude;
      docRetour.geo.longitude = doc.geoPosLongitude;
      docRetour.geo['@type'] = 'GeoCoordinates';
      docRetour.geoPosition = {};
      docRetour.geoPosition.type = 'Point';
      docRetour.geoPosition.coordinates = [parseFloat(doc.geoPosLongitude), parseFloat(doc.geoPosLatitude)];
    }
  }

  return docRetour;
};

URL._encodeParams = function(params, prefix) {
  const str = [];
  for (const p in params) {
    if (params.hasOwnProperty(p)) {
      const k = prefix ? `${prefix}[${p}]` : p;
      const v = params[p];
      if (typeof v === 'object') {
        str.push(this._encodeParams(v, k));
      } else {
        const encodedKey = encodeString(k).replace('%5B', '[').replace('%5D', ']');
        str.push(`${encodedKey}=${encodeString(v)}`);
      }
    }
  }
  return str.join('&').replace(/%20/g, '+');
};

Meteor.methods({
  userup (geo) {
    check(geo, { longitude: Number, latitude: Number });
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    this.unblock();
    if (Citoyens.update({
      _id: new Mongo.ObjectID(this.userId),
    }, {
      $set: {
        geoPosition: {
          type: 'Point',
          coordinates: [parseFloat(geo.longitude), parseFloat(geo.latitude)],
        },
      },
    })) {
      return true;
    }
    return false;
  },
  likeScope (newsId, scope) {
    check(newsId, String);
    check(scope, String);
    check(scope, Match.Where(function(name) {
      return _.contains(['news', 'comments'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const doc = {};
    doc.id = newsId;
    doc.collection = scope;
    doc.action = 'voteUp';
    const voteQuery = {};
    voteQuery._id = new Mongo.ObjectID(newsId);
    voteQuery[`voteUp.${this.userId}`] = { $exists: true };

    if (News.findOne(voteQuery)) {
      doc.unset = 'true';
      Meteor.call('addAction', doc);
    } else {
      const voteQuery = {};
      voteQuery._id = new Mongo.ObjectID(newsId);
      voteQuery[`voteDown.${this.userId}`] = { $exists: true };

      if (News.findOne(voteQuery)) {
        const rem = {};
        rem.id = newsId;
        rem.collection = 'news';
        rem.action = 'voteDown';
        rem.unset = 'true';
        Meteor.call('addAction', rem);
      }
      Meteor.call('addAction', doc);
    }
  },
  dislikeScope (newsId, scope) {
    check(newsId, String);
    check(scope, String);
    check(scope, Match.Where(function(name) {
      return _.contains(['news', 'comments'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const doc = {};
    doc.id = newsId;
    doc.collection = scope;
    doc.action = 'voteDown';
    const voteQuery = {};
    voteQuery._id = new Mongo.ObjectID(newsId);
    voteQuery[`voteDown.${this.userId}`] = { $exists: true };

    if (News.findOne(voteQuery)) {
      doc.unset = 'true';
      Meteor.call('addAction', doc);
    } else {
      const voteQuery = {};
      voteQuery._id = new Mongo.ObjectID(newsId);
      voteQuery[`voteUp.${this.userId}`] = { $exists: true };

      if (News.findOne(voteQuery)) {
        const rem = {};
        rem.id = newsId;
        rem.collection = 'news';
        rem.action = 'voteUp';
        rem.unset = 'true';
        Meteor.call('addAction', rem);
      }
      Meteor.call('addAction', doc);
    }
  },
  addAction (doc) {
    check(doc, Object);
    check(doc.id, String);
    check(doc.collection, String);
    check(doc.action, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const retour = apiCommunecter.postPixel('action', 'addaction', doc);
    return retour;
  },
  followPersonExist (connectUserId) {
    // type : person / follows
    // connectUserId
    check(connectUserId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};
    doc.connectUserId = connectUserId;
    const retour = apiCommunecter.postPixel('person', 'follows', doc);
    return retour;
  },
  followPerson (doc) {
    // type : person / follows
    // invitedUserName
    // invitedUserEmail
    check(doc, SchemasFollowRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const retour = apiCommunecter.postPixel('person', 'follows', doc);
    return retour;
  },
  saveattendeesEvent (eventId, email, inviteUserId) {
    check(eventId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};
    doc.parentId = eventId;
    doc.parentType = 'events';
    doc.childType = 'citoyens';
    if (typeof email !== 'undefined') {
      doc.childId = Citoyens.findOne({ email: email.toLowerCase() })._id._str;
    } else if (typeof inviteUserId !== 'undefined' && inviteUserId) {
      doc.childId = inviteUserId;
    } else {
      doc.childId = this.userId;
    }
    const retour = apiCommunecter.postPixel('link', 'connect', doc);
    return retour;
  },
  followEntity (connectId, parentType, childId) {
    check(connectId, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};

    doc.parentId = connectId;
    doc.childType = 'citoyens';

    /* if(parentType=="organizations"){
  doc.connectType="member";
  }else if(parentType=="projects"){
  doc.connectType="contributor";
  }else if(parentType=="citoyens"){
  doc.connectType="followers";
} */

    doc.childId = (typeof childId !== 'undefined') ? childId : this.userId;
    doc.parentType = parentType;
    const retour = apiCommunecter.postPixel('link', 'follow', doc);
    return retour;
  },
  shareEntity (doc) {
  // console.log(doc);
    check(doc, SchemasShareRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    doc.childType = 'citoyens';
    doc.connectType = 'share';
    doc.childId = this.userId;
    const retour = apiCommunecter.postPixel('news', 'share', doc);
    return retour;
  },
  collectionsAdd (id, type) {
    check(id, String);
    check(type, String);
    check(type, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens', 'poi', 'classified'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};
    doc.id = id;
    doc.type = type;
    doc.collection = 'favorites';
    const retour = apiCommunecter.postPixel('collections', 'add', doc);
    return retour;
  },
  connectEntity (connectId, parentType, childId, connectType) {
    check(connectId, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};
    doc.parentId = connectId;
    doc.childType = 'citoyens';
    if (connectType === 'admin' && childId) {
      check(childId, String);
      const collection = nameToCollection(parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(connectId) }).isAdmin(this.userId)) {
        throw new Meteor.Error('not-authorized');
      }
      doc.connectType = 'admin';
    } else if (parentType === 'organizations' && connectType !== 'admin') {
      doc.connectType = 'member';
    } else if (parentType === 'projects' && connectType !== 'admin') {
      doc.connectType = 'contributor';
    } else if (parentType === 'citoyens' && connectType !== 'admin') {
      doc.connectType = 'followers';
    } else if (parentType === 'events' && connectType !== 'admin') {
      doc.connectType = 'attendee';
    }

    doc.childId = (typeof childId !== 'undefined') ? childId : this.userId;
    doc.parentType = parentType;
    const retour = apiCommunecter.postPixel('link', 'connect', doc);
    return retour;
  },
  disconnectEntity (connectId, parentType, connectType, childId, childType) {
    check(connectId, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    /* childId:5534fd9da1aa14201b0041cb
    childType:citoyens
    parentType:projects
    parentId:590c5877dd0452330ca1fa1f
    connectType:followers */


    const doc = {};
    doc.parentId = connectId;
    doc.childType = (typeof childType !== 'undefined' && childType !== null) ? childType : 'citoyens';
    if (parentType === 'organizations') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'members';
    } else if (parentType === 'projects') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'contributors';
    } else if (parentType === 'citoyens') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'followers';
    } else if (parentType === 'events') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'attendees';
    }
    if (childId !== this.userId) {
      const collection = nameToCollection(parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(connectId) }).isAdmin(this.userId)) {
        throw new Meteor.Error('not-authorized');
      }
    }
    doc.childId = (typeof childId !== 'undefined' && childId !== null) ? childId : this.userId;
    doc.parentType = parentType;
    console.log(doc);
    const retour = apiCommunecter.postPixel('link', 'disconnect', doc);
    return retour;
  },
  validateEntity (parentId, parentType, childId, childType, linkOption) {
    check(parentId, String);
    check(childId, String);
    check(childType, String);
    check(linkOption, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    check(childType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (_.contains(['events', 'projects', 'organizations', 'citoyens'], parentType) && this.userId === childId && linkOption === 'isInviting') {

    } else {
      const collection = nameToCollection(parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(parentId) }).isAdmin(this.userId)) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const doc = {};
    doc.parentId = parentId;
    doc.parentType = parentType;
    doc.childId = childId;
    doc.childType = childType;
    doc.linkOption = linkOption;
    const retour = apiCommunecter.postPixel('link', 'validate', doc);
    return retour;
  },
  multiConnectEntity (parentId, parentType, connectType, childs) {
    check(parentId, String);
    check(parentType, String);
    check(connectType, String);
    check(childs, Array);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};
    doc.parentId = parentId;
    doc.connectType = connectType;
    doc.parentType = parentType;
    doc.childs = childs;
    const retour = apiCommunecter.postPixel('link', 'multiconnect', doc);
    return retour;
  },
  inviteattendeesEvent (doc) {
    check(doc, SchemasInviteAttendeesEventRest);
    check(doc.invitedUserEmail, ValidEmail);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    /* if (!Meteor.call('isEmailValid', doc.invitedUserEmail)) {
      throw new Meteor.Error('Email not valid');
    } */
    const insertDoc = {};
    insertDoc.parentId = doc.eventId;
    insertDoc.parentType = 'events';
    insertDoc.childType = 'citoyens';
    insertDoc.childEmail = doc.invitedUserEmail;
    insertDoc.childName = doc.invitedUserName;
    insertDoc.connectType = 'attendees';
    insertDoc.childId = '';
    const retour = apiCommunecter.postPixel('link', 'connect', insertDoc);
    return retour;
  },
  invitationScopeForm (doc) {
    check(doc, SchemasInvitationsRest);
    check(doc.childEmail, ValidEmail);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    /* if (!Meteor.call('isEmailValid', doc.childEmail)) {
      throw new Meteor.Error('Email not valid');
    } */
    const insertDoc = {};
    insertDoc.parentId = doc.parentId;
    insertDoc.parentType = doc.parentType;
    insertDoc.childType = doc.childType;
    if (doc.parentType === 'organizations') {
      insertDoc.connectType = (typeof doc.connectType !== 'undefined' && doc.connectType !== null) ? doc.connectType : 'members';
    } else if (doc.parentType === 'projects') {
      insertDoc.connectType = (typeof doc.connectType !== 'undefined' && doc.connectType !== null) ? doc.connectType : 'contributors';
    } else if (doc.parentType === 'citoyens') {
      insertDoc.connectType = (typeof doc.connectType !== 'undefined' && doc.connectType !== null) ? doc.connectType : 'followers';
    } else if (doc.parentType === 'events') {
      insertDoc.connectType = (typeof doc.connectType !== 'undefined' && doc.connectType !== null) ? doc.connectType : 'attendees';
    }
    if (doc.childType === 'citoyens') {
      insertDoc.childEmail = doc.childEmail;
      insertDoc.childName = doc.childName;
      insertDoc.childId = '';
    } else if (doc.childType === 'organizations') {
      insertDoc.childEmail = doc.childEmail;
      insertDoc.childName = doc.childName;
      insertDoc.childId = '';
    }
    const retour = apiCommunecter.postPixel('link', 'connect', insertDoc);
    return retour;
  },
  invitationScope (parentId, parentType, connectType, childType, childEmail, childName, childId) {
    console.log(`${parentId}, ${parentType}, ${connectType}, ${childType}, ${childEmail}, ${childName}, ${childId}`);
    check(parentId, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    check(childType, String);
    check(childType, Match.Where(function(name) {
      return _.contains(['organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const doc = {};
    doc.parentId = parentId;
    doc.parentType = parentType;
    doc.childType = childType;
    if (parentType === 'organizations') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'members';
    } else if (parentType === 'projects') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'contributors';
    } else if (parentType === 'citoyens') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'followers';
    } else if (parentType === 'events') {
      doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ? connectType : 'attendees';
    }
    if (childType === 'citoyens') {
      if (childId) {
        check(childId, String);
        doc.childId = childId;
        const invite = Citoyens.findOne({ _id: new Mongo.ObjectID(childId) });
        if (invite) {
          doc.childEmail = invite.email;
          doc.childName = invite.name;
        } else {
          throw new Meteor.Error('Citizen not exist');
        }
      } else {
        check(childName, String);
        check(childEmail, String);
        /* if (!Meteor.call('isEmailValid', childEmail)) {
          throw new Meteor.Error('Email not valid');
        } */
        doc.childEmail = childEmail;
        doc.childName = childName;
      }
    } else if (childType === 'organizations') {
      check(childId, String);
      const invite = Organizations.findOne({ _id: new Mongo.ObjectID(childId) });
      if (invite) {
        doc.childName = invite.name;
      } else {
        throw new Meteor.Error('Citizen not exist');
      }
      doc.childId = childId;
    }
    const retour = apiCommunecter.postPixel('link', 'connect', doc);
    return retour;
  },
  checkUsername (username) {
    check(username, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).username !== username) {
      const responsePost = HTTP.call('POST', `${Meteor.settings.endpoint}/${Meteor.settings.module}/person/checkusername`, {
        params: { username },
      });
      // console.log(responsePost.data);
      return responsePost.data;
    }
    return true;
  },
  getUser (callerId) {
    check(callerId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const user = Citoyens.findOne({ _id: new Mongo.ObjectID(callerId) }, {
      fields: {
        _id: 1,
        name: 1,
        profilThumbImageUrl: 1,
      },
    });

    if (user && user._id) {
      return user;
    }
    throw new Meteor.Error('not user');
  },
  searchTagautocomplete (query, options) {
    check(query, String);
    if (!query) return [];

    options = options || {};

    // guard against client-side DOS: hard limit to 50
    if (options.limit) {
      options.limit = Math.min(50, Math.abs(options.limit));
    } else {
      options.limit = 50;
    }

    // TODO fix regexp to support multiple tokens
    const regex = new RegExp(`^${query}`);
    // List.find({$or : [{name: {$regex:  regex, $options: "i"}},{'postalCodes.postalCode': {$regex:  regex}}]}, options).fetch();
    return Lists.findOne({ name: 'tags' }).list;
  },
  searchMemberautocomplete (search) {
    check(search, Object);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const retour = apiCommunecter.postPixelMethod('search', 'searchmemberautocomplete', search);
    // console.log(retour);
    return retour.data;
  },
  searchGlobalautocomplete (search) {
    check(search, Object);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    /* name:syl
locality:
searchType[]:persons
searchType[]:organizations
searchType[]:projects
searchType[]:events
searchType[]:cities
searchBy:ALL
indexMin:0
indexMax:20 */
    search.indexMin = 0;
    search.indexMax = 20;
    const retour = apiCommunecter.postPixelMethod('search', 'globalautocomplete', search);
    return retour.data;
  },
  updateSettings (type, value, typeEntity, idEntity) {
    check(type, String);
    check(typeEntity, String);
    check(idEntity, String);
    check(typeEntity, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (typeEntity === 'organizations' || typeEntity === 'projects' || typeEntity === 'events') {
      const collection = nameToCollection(typeEntity);
      if (!collection.findOne({ _id: new Mongo.ObjectID(idEntity) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
      check(type, Match.Where(function(name) {
        return _.contains(['isOpenData', 'isOpenEdition'], name);
      }));
      check(value, Boolean);
    } else if (typeEntity === 'citoyens') {
      if (this.userId !== idEntity) {
        throw new Meteor.Error('not-authorized');
      }
      check(type, Match.Where(function(name) {
        return _.contains(['directory', 'birthDate', 'email', 'locality', 'phone', 'isOpenData'], name);
      }));
      if (type === 'isOpenData') {
        check(value, Boolean);
      } else {
        check(value, Match.Where(function(name) {
          return _.contains(['public', 'private', 'hide'], name);
        }));
      }
    }

    const doc = {};
    doc.typeEntity = typeEntity;
    doc.type = type;
    doc.idEntity = idEntity;
    doc.value = value;

    const retour = apiCommunecter.postPixel('element', 'updatesettings', doc);
    return retour;
  },
  insertComment (doc) {
    check(doc, SchemasCommentsRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!doc.parentCommentId) {
      doc.parentCommentId = '';
    }
    const retour = apiCommunecter.postPixel('comment', 'save', doc);
    return retour;
  },
  updateComment (modifier, documentId) {
    check(modifier.$set, SchemasCommentsEditRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Comments.findOne({ _id: documentId }).isAuthor()) {
      throw new Meteor.Error('not-authorized');
    }
    const doc = {};
    /* doc.id = documentId;
    doc.content = modifier["$set"].text;
    doc.contextId = modifier["$set"].contextId;
    doc.contextType = modifier["$set"].contextType;
    if(modifier["$set"].parentCommentId){
      doc.parentCommentId = modifier["$set"].parentCommentId;
    }else{
      doc.parentCommentId = "";
    } */

    doc.name = 'text';
    doc.value = modifier.$set.text;
    doc.pk = documentId._str;

    const retour = apiCommunecter.postPixel('comment', 'updatefield', doc);
    return retour;
  },
  deleteComment (commentId) {
    check(commentId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    if (!Comments.findOne({ _id: new Mongo.ObjectID(commentId) }).isAuthor()) {
      throw new Meteor.Error('not-authorized');
    }

    const retour = apiCommunecter.postPixel('comment', `delete/id/${commentId}`, {});
    return retour;
  },
  updateBlock (modifier, documentId) {
    check(modifier.$set.typeElement, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'poi', 'organizations', 'citoyens'], name);
    }));

    if (modifier.$set.typeElement === 'organizations' || modifier.$set.typeElement === 'projects' || modifier.$set.typeElement === 'poi' || modifier.$set.typeElement === 'events') {
      const collection = nameToCollection(modifier.$set.typeElement);
      if (!collection.findOne({ _id: new Mongo.ObjectID(documentId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (modifier.$set.typeElement === 'citoyens') {
      if (this.userId !== documentId) {
        throw new Meteor.Error('not-authorized');
      }
    }

    if (modifier.$set.typeElement === 'citoyens') {
      check(modifier.$set.block, Match.Where(function(name) {
        return _.contains(['descriptions', 'network', 'info', 'locality', 'preferences'], name);
      }));
      // block description,contact,info
      BlockCitoyensRest[modifier.$set.block].clean(modifier.$set);
      check(modifier.$set, BlockCitoyensRest[modifier.$set.block]);
    } else if (modifier.$set.typeElement === 'events') {
      check(modifier.$set.block, Match.Where(function(name) {
        return _.contains(['descriptions', 'network', 'info', 'when', 'locality', 'preferences'], name);
      }));
      // block description,contact,info,when
      BlockEventsRest[modifier.$set.block].clean(modifier.$set);
      check(modifier.$set, BlockEventsRest[modifier.$set.block]);
    } else if (modifier.$set.typeElement === 'organizations') {
      check(modifier.$set.block, Match.Where(function(name) {
        return _.contains(['descriptions', 'network', 'info', 'locality', 'preferences'], name);
      }));
      // block description,contact,info,when
      BlockOrganizationsRest[modifier.$set.block].clean(modifier.$set);
      check(modifier.$set, BlockOrganizationsRest[modifier.$set.block]);
    } else if (modifier.$set.typeElement === 'projects') {
      check(modifier.$set.block, Match.Where(function(name) {
        return _.contains(['descriptions', 'network', 'info', 'when', 'locality', 'preferences'], name);
      }));
      // block description,contact,info,when
      BlockProjectsRest[modifier.$set.block].clean(modifier.$set);
      check(modifier.$set, BlockProjectsRest[modifier.$set.block]);
    } else if (modifier.$set.typeElement === 'poi') {
      check(modifier.$set.block, Match.Where(function(name) {
        return _.contains(['descriptions', 'info', 'locality', 'preferences'], name);
      }));
      // block description,contact,info,when
      BlockProjectsRest[modifier.$set.block].clean(modifier.$set);
      check(modifier.$set, BlockProjectsRest[modifier.$set.block]);
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'block');
    if (modifier.$set.typeElement === 'citoyens' && modifier.$set.block === 'info') {
      if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).username !== modifier.$set.username) {
        docRetour.username = modifier.$set.username;
      }
    }
    if (modifier.$set.block === 'locality') {
      docRetour.pk = documentId;
      docRetour.type = modifier.$set.typeElement;
      // console.log(docRetour);
      const retour = apiCommunecter.postPixel('element', `updatefields/type/${modifier.$set.typeElement}`, docRetour);
      return retour;
    } else if (modifier.$set.block === 'preferences') {
    // console.log('preferences');
      if (modifier.$set.typeElement === 'citoyens') {
        const fieldsArray = ['email', 'locality', 'phone', 'directory', 'birthDate', 'isOpenData'];
        _.each(fieldsArray, (field) => {
          // console.log(`updateSettings,${field},${modifier["$set"][`preferences.${field}`]},${modifier["$set"].typeElement},${documentId}`);
          Meteor.call('updateSettings', field, modifier.$set[`preferences.${field}`], modifier.$set.typeElement, documentId);
        });
      } else if (modifier.$set.typeElement === 'organizations' || modifier.$set.typeElement === 'projects' || modifier.$set.typeElement === 'events') {
        const fieldsArray = ['isOpenEdition', 'isOpenData'];
        _.each(fieldsArray, (field) => {
          // console.log(`updateSettings,${field},${modifier["$set"][`preferences.${field}`]},${modifier["$set"].typeElement},${documentId}`);
          Meteor.call('updateSettings', field, modifier.$set[`preferences.${field}`], modifier.$set.typeElement, documentId);
        });
      }
      return true;
    }
    docRetour.id = documentId;
    docRetour.block = modifier.$set.block;
    docRetour.typeElement = modifier.$set.typeElement;
    // console.log(docRetour);
    const retour = apiCommunecter.postPixel('element', 'updateblock', docRetour);
    return retour;
  },
  updateCitoyen (modifier, documentId) {
    SchemasCitoyensRest.clean(modifier.$set);
    check(modifier.$set, SchemasCitoyensRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (this.userId !== documentId) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'citoyens');
    docRetour.id = documentId;
    docRetour.key = 'citoyen';
    docRetour.collection = 'citoyens';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
  insertNew (doc) {
    check(doc.parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    check(doc, SchemasNewsRestBase[doc.parentType]);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (doc.parentType === 'citoyens') {
      if (this.userId !== doc.parentId) {
        throw new Meteor.Error('not-authorized');
      }
      if (!doc.scope) {
        doc.scope = 'restricted';
      }
    } else if (doc.parentType === 'organizations') {
      const collection = nameToCollection(doc.parentType);
      const autorize = collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) });
      if (autorize.isAdmin() || autorize.isMembers(this.userId)) {
      } else {
        throw new Meteor.Error('not-authorized');
      }
      if (!doc.scope) {
        doc.scope = 'restricted';
      }
    } else if (doc.parentType === 'projects') {
      const collection = nameToCollection(doc.parentType);
      const autorize = collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) });
      if (autorize.isAdmin() || autorize.isContributors(this.userId)) {
      } else {
        throw new Meteor.Error('not-authorized');
      }
      if (!doc.scope) {
        doc.scope = 'restricted';
      }
    } else if (doc.parentType === 'events') {
      const collection = nameToCollection(doc.parentType);
      const autorize = collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) });
      if (autorize.isAdmin() || autorize.isAttendees(this.userId)) {
      } else {
        throw new Meteor.Error('not-authorized');
      }
      if (!doc.scope) {
        doc.scope = 'restricted';
      }
    }

    const retour = apiCommunecter.postPixel('news', 'save', doc);
    return retour;
  },
  updateNew (modifier, documentId) {
    check(modifier.$set.parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    // check(modifier["$set"], SchemasNewsRest);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const newsOne = News.findOne({ _id: new Mongo.ObjectID(documentId) });
    if (newsOne.target.type === 'organizations' || newsOne.target.type === 'projects' || newsOne.target.type === 'poi' || newsOne.target.type === 'events') {
      const collection = nameToCollection(newsOne.target.type);
      if (!newsOne.isAuthor()) {
        if (!collection.findOne({ _id: new Mongo.ObjectID(newsOne.target.id) }).isAdmin()) {
          throw new Meteor.Error('not-authorized');
        }
      }
    } else if (newsOne.target.type === 'citoyens') {
      if (!newsOne.isAuthor()) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const doc = modifier.$set;
    doc.idNews = documentId;
    const retour = apiCommunecter.postPixel('news', 'update', doc);
    return retour;
  },
  updateNewOld (modifier, documentId) {
    check(modifier.$set, SchemasNewsRest);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!News.findOne({ _id: documentId }).isAuthor()) {
      throw new Meteor.Error('not-authorized');
    }

    const updateNew = {};
    updateNew.name = `newsContent${documentId._str}`;
    updateNew.value = modifier.$set.text;
    updateNew.pk = documentId._str;

    const retour = apiCommunecter.postPixel('news', 'updatefield', updateNew);
    return retour;
  },
  deleteNew (newsId) {
    check(newsId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const newsOne = News.findOne({ _id: new Mongo.ObjectID(newsId) });
    if (newsOne.target.type === 'organizations' || newsOne.target.type === 'projects' || newsOne.target.type === 'poi' || newsOne.target.type === 'events') {
      const collection = nameToCollection(newsOne.target.type);
      if (!newsOne.isAuthor()) {
        if (!collection.findOne({ _id: new Mongo.ObjectID(newsOne.target.id) }).isAdmin()) {
          throw new Meteor.Error('not-authorized');
        }
      }
    } else if (newsOne.target.type === 'citoyens') {
      if (!newsOne.isAuthor()) {
        throw new Meteor.Error('not-authorized');
      }
    }

    /* if (newsOne && newsOne.media && newsOne.media.images) {
      const arrayId = newsOne.media.images.map(_id => new Mongo.ObjectID(_id));
      const newsDocs = Documents.find({
        _id: { $in: arrayId },
      });
      newsDocs.forEach((newsDoc) => {
        const doc = {};
        doc.name = newsDoc.name;
        doc.parentId = newsOne.target.id;
        doc.parentType = newsOne.target.type;
        doc.path = newsDoc.path;
        doc.docId = newsDoc._id._str;
        apiCommunecter.postPixel('document', `delete/dir/${Meteor.settings.module}/type/${newsOne.target.type}/parentId/${newsOne.target.id}`, doc);
      });
    } */

    const retour = apiCommunecter.postPixel('news', `delete/id/${newsId}`, {});
    return retour;
  },
  photoNews (photo, str, type, idType, newsId) {
    check(str, String);
    check(type, String);
    check(idType, String);
    check(newsId, Match.Maybe(String));
    check(type, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens', 'poi', 'classified'], name);
    }));
    const collection = nameToCollection(type);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (type === 'citoyens') {
      if (this.userId !== idType) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (type === 'projects') {
      if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAdmin()) {
        if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isContributors(this.userId)) {
          throw new Meteor.Error('not-authorized');
        }
      }
    } else if (type === 'organizations') {
      if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAdmin()) {
        if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isMembers(this.userId)) {
          throw new Meteor.Error('not-authorized');
        }
      }
    } else if (type === 'events') {
      if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAdmin()) {
        if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAttendees(this.userId)) {
          throw new Meteor.Error('not-authorized');
        }
      }
    } else if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }
    const retourUpload = apiCommunecter.postUploadPixel(type, idType, 'newsImage', photo, str);
    if (retourUpload) {
      const insertDoc = {};
      insertDoc.id = idType;
      insertDoc.type = type;
      insertDoc.folder = `${type}/${idType}/album`;
      insertDoc.moduleId = 'communecter';
      insertDoc.doctype = 'image';
      insertDoc.name = retourUpload.name;
      insertDoc.size = retourUpload.size;
      // insertDoc.date = "";
      insertDoc.contentKey = 'slider';
      insertDoc.formOrigin = 'news';
      // console.log(insertDoc);
      const doc = apiCommunecter.postPixel('document', 'save', insertDoc);
      if (doc) {
        // {"result":true,"msg":"Document bien enregistr\u00e9","id":{"$id":"58df810add04528643014012"},"name":"moon.png"}
        if (typeof newsId !== 'undefined') {
          const array = News.findOne({ _id: new Mongo.ObjectID(newsId) });
          if (array && array.media && array.media.images && array.media.images.length > 0) {
            // console.log(array.media.images.length);
            const countImages = array.media.images.length + 1;
            News.update({ _id: new Mongo.ObjectID(newsId) }, { $set: { 'media.countImages': countImages.toString() }, $push: { 'media.images': doc.data.id.$id } });
            return { photoret: doc.data.id.$id, newsId };
          }
          const media = {};
          media.type = 'gallery_images';
          media.countImages = '1';
          media.images = [doc.data.id.$id];
          News.update({ _id: new Mongo.ObjectID(newsId) }, { $set: { media } });
          return { photoret: doc.data.id.$id, newsId };
        }
        const insertNew = {};
        insertNew.parentId = idType;
        insertNew.parentType = type;
        insertNew.text = ' ';
        insertNew.media = {};
        insertNew.media.type = 'gallery_images';
        insertNew.media.countImages = '1';
        insertNew.media.images = [doc.data.id.$id];
        const newsIdRetour = Meteor.call('insertNew', insertNew);
        if (newsIdRetour) {
          return { photoret: doc.data.id.$id, newsId: newsIdRetour.data.id.$id };
        }
        throw new Meteor.Error('photoNews error');
      } else {
        throw new Meteor.Error('insertDocument error');
      }
    } else {
      throw new Meteor.Error('postUploadPixel error');
    }
  },
  insertEvent (doc) {
    SchemasEventsRest.clean(doc);
    check(doc, SchemasEventsRest);
    check(doc.organizerType, Match.Where(function(name) {
      return _.contains(['projects', 'organizations', 'citoyens'], name);
    }));
    // console.log(doc);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (doc.organizerType === 'citoyens') {
      if (this.userId !== doc.organizerId) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (doc.organizerType === 'projects' || doc.organizerType === 'organizations') {
      const collection = nameToCollection(doc.organizerType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(doc.organizerId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const docRetour = baseDocRetour({}, doc, 'events');
    docRetour.key = 'event';
    docRetour.collection = 'events';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
  updateEvent (modifier, documentId) {
    SchemasEventsRest.clean(modifier.$set);
    check(modifier.$set, SchemasEventsRest);
    check(modifier.$set.organizerType, Match.Where(function(name) {
      return _.contains(['projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (modifier.$set.organizerType === 'citoyens') {
      if (this.userId !== modifier.$set.organizerId) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (modifier.$set.organizerType === 'projects' || modifier.$set.organizerType === 'organizations') {
      const collection = nameToCollection(modifier.$set.organizerType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.organizerId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }
    if (!Events.findOne({ _id: new Mongo.ObjectID(documentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'events');
    docRetour.id = documentId;
    docRetour.key = 'event';
    docRetour.collection = 'events';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
  insertProject (doc) {
    SchemasProjectsRest.clean(doc);
    check(doc, SchemasProjectsRest);
    check(doc.parentType, Match.Where(function(name) {
      return _.contains(['organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (doc.parentType === 'citoyens') {
      if (this.userId !== doc.parentId) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (doc.parentType === 'organizations') {
      const collection = nameToCollection(doc.parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const docRetour = baseDocRetour({}, doc, 'projects');
    docRetour.key = 'project';
    docRetour.collection = 'projects';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
  updateProject (modifier, documentId) {
    SchemasProjectsRest.clean(modifier.$set);
    check(modifier.$set, SchemasProjectsRest);
    check(modifier.$set.parentType, Match.Where(function(name) {
      return _.contains(['organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (modifier.$set.parentType === 'citoyens') {
      if (this.userId !== modifier.$set.parentId) {
        throw new Meteor.Error('not-authorized');
      }
    } else if (modifier.$set.parentType === 'organizations') {
      const collection = nameToCollection(modifier.$set.parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.parentId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }
    if (!Projects.findOne({ _id: new Mongo.ObjectID(documentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'projects');
    docRetour.id = documentId;
    docRetour.key = 'project';
    docRetour.collection = 'projects';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
  insertPoi (doc) {
    SchemasPoiRest.clean(doc);
    check(doc, SchemasPoiRest);
    check(doc.parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (doc.parentType === 'citoyens') {
      if (this.userId !== doc.parentId) {
        throw new Meteor.Error('not-authorized');
      }
    } else {
      const collection = nameToCollection(doc.parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const docRetour = baseDocRetour({}, doc, 'poi');
    docRetour.key = 'poi';
    docRetour.collection = 'poi';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
  updatePoi (modifier, documentId) {
    SchemasPoiRest.clean(modifier.$set);
    check(modifier.$set, SchemasPoiRest);
    check(modifier.$set.parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (modifier.$set.parentType === 'citoyens') {
      if (this.userId !== modifier.$set.parentId) {
        throw new Meteor.Error('not-authorized');
      }
    } else {
      const collection = nameToCollection(modifier.$set.parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.parentId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }
    if (!Poi.findOne({ _id: new Mongo.ObjectID(documentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'poi');
    docRetour.id = documentId;
    docRetour.key = 'poi';
    docRetour.collection = 'poi';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
  insertClassified (doc) {
    SchemasClassifiedRest.clean(doc);
    check(doc, SchemasClassifiedRest);
    check(doc.parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (doc.parentType === 'citoyens') {
      if (this.userId !== doc.parentId) {
        throw new Meteor.Error('not-authorized');
      }
    } else {
      const collection = nameToCollection(doc.parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const docRetour = baseDocRetour({}, doc, 'classified');
    docRetour.key = 'classified';
    docRetour.collection = 'classified';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
  updateClassified (modifier, documentId) {
    SchemasClassifiedRest.clean(modifier.$set);
    check(modifier.$set, SchemasClassifiedRest);
    check(modifier.$set.parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (modifier.$set.parentType === 'citoyens') {
      if (this.userId !== modifier.$set.parentId) {
        throw new Meteor.Error('not-authorized');
      }
    } else {
      const collection = nameToCollection(modifier.$set.parentType);
      if (!collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.parentId) }).isAdmin()) {
        throw new Meteor.Error('not-authorized');
      }
    }
    if (!Classified.findOne({ _id: new Mongo.ObjectID(documentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'classified');
    docRetour.id = documentId;
    docRetour.key = 'classified';
    docRetour.collection = 'classified';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
  photoScope (scope, photo, str, idType) {
    check(str, String);
    check(idType, String);
    check(scope, String);
    check(scope, Match.Where(function(name) {
      return _.contains(['events', 'projects', 'organizations', 'citoyens', 'poi', 'classified'], name);
    }));
    const collection = nameToCollection(scope);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!collection.findOne({ _id: new Mongo.ObjectID(idType) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }
    const retourUpload = apiCommunecter.postUploadPixel(scope, idType, 'avatar', photo, str);
    if (retourUpload) {
      const insertDoc = {};
      insertDoc.id = idType;
      insertDoc.type = scope;
      insertDoc.folder = `${scope}/${idType}`;
      insertDoc.moduleId = 'communecter';
      insertDoc.author = this.userId;
      insertDoc.doctype = 'image';
      insertDoc.name = retourUpload.name;
      insertDoc.size = retourUpload.size;
      insertDoc.contentKey = 'profil';
      const doc = apiCommunecter.postPixel('document', 'save', insertDoc);
      // console.log(doc);
      if (doc) {
        collection.update({ _id: new Mongo.ObjectID(idType) }, { $set: {
          profilImageUrl: `/upload/communecter/${scope}/${idType}/${retourUpload.name}`,
          profilThumbImageUrl: `/upload/communecter/${scope}/${idType}/thumb/profil-resized.png?=${new Date()}${Math.floor((Math.random() * 100) + 1)}`,
          profilMarkerImageUrl: `/upload/communecter/${scope}/${idType}/thumb/profil-marker.png?=${new Date()}${Math.floor((Math.random() * 100) + 1)}`,
        } });
        return doc.data.id.$id;
      }
      throw new Meteor.Error('insertDocument error');
    } else {
      throw new Meteor.Error('postUploadPixel error');
    }
  },
  insertOrganization (doc) {
    // console.log(doc);
    SchemasOrganizationsRest.clean(doc);
    check(doc, SchemasOrganizationsRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, doc, 'organizations');
    docRetour.key = 'organization';
    docRetour.collection = 'organizations';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
  updateOrganization (modifier, documentId) {
    SchemasOrganizationsRest.clean(modifier.$set);
    check(modifier.$set, SchemasOrganizationsRest);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Organizations.findOne({ _id: new Mongo.ObjectID(documentId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = baseDocRetour({}, modifier.$set, 'organizations');
    docRetour.id = documentId;
    docRetour.key = 'organization';
    docRetour.collection = 'organizations';

    // console.log(docRetour);

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
  createUserAccountRest (user) {
    // //console.log(user);
    check(user, Object);
    check(user.name, String);
    check(user.username, String);
    check(user.email, String);
    check(user.password, String);
    check(user.codepostal, String);
    check(user.city, String);

    const passwordTest = new RegExp('(?=.{8,}).*', 'g');
    if (passwordTest.test(user.password) === false) {
      throw new Meteor.Error('Password is Too short');
    }

    if (!IsValidEmail(user.email)) {
      throw new Meteor.Error('Email not valid');
    }

    if (Citoyens.find({ email: user.email }).count() !== 0) {
      throw new Meteor.Error('Email not unique');
    }

    if (Citoyens.find({ username: user.username }).count() !== 0) {
      throw new Meteor.Error('Username not unique');
    }

    const insee = Cities.findOne({ insee: user.city });

    console.log({
      name: user.name,
      email: user.email,
      username: user.username,
      pwd: user.password,
      cp: user.codepostal,
      city: insee.insee,
      geoPosLatitude: insee.geo.latitude,
      geoPosLongitude: insee.geo.longitude,
    });

    try {
      const response = HTTP.call('POST', `${Meteor.settings.endpoint}/${Meteor.settings.module}/person/register`, {
        params: {
          name: user.name,
          email: user.email,
          username: user.username,
          pwd: user.password,
          cp: user.codepostal,
          city: insee.insee,
          geoPosLatitude: insee.geo.latitude,
          geoPosLongitude: insee.geo.longitude,
        },
      });
      // console.log(response);
      if (response.data.result && response.data.id) {
        const userId = response.data.id;
        return userId;
      }
      throw new Meteor.Error(response.data.msg);
    } catch (e) {
      throw new Meteor.Error('Error server');
    }
  },
  getcitiesbylatlng (latlng) {
    check(latlng, { latitude: Number, longitude: Number });
    Cities._ensureIndex({
      geoShape: '2dsphere',
    });
    return Cities.findOne({ geoShape:
  { $geoIntersects:
    { $geometry: { type: 'Point',
      coordinates: [latlng.longitude, latlng.latitude] },
    },
  },
    }, { _disableOplog: true });
  },
  getcitiesbypostalcode (cp) {
    check(cp, String);
    return Cities.find({ 'postalCodes.postalCode': cp }).fetch();
  },
  searchCities (query, options) {
    check(query, String);
    if (!query) return [];

    options = options || {};

    // guard against client-side DOS: hard limit to 50
    if (options.limit) {
      options.limit = Math.min(50, Math.abs(options.limit));
    } else {
      options.limit = 50;
    }

    // TODO fix regexp to support multiple tokens
    const regex = new RegExp(`^${query}`);
    return Cities.find({ $or: [{ name: { $regex: regex, $options: 'i' } }, { 'postalCodes.postalCode': { $regex: regex } }] }, options).fetch();
  },
  markRead (notifId) {
    check(notifId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const notif = {};
    notif.id = notifId;
    const retour = apiCommunecter.postPixel('notification', 'marknotificationasread', notif);
    return retour;
  },
  markSeen (notifId) {
    check(notifId, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const notif = {};
    notif.id = notifId;
    const retour = apiCommunecter.postPixel('notification', 'update', notif);
    return retour;
  },
  alertCount () {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    return ActivityStream.api.queryUnseen().count();
  },
  registerClick (notifId) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
  },
  allRead () {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const notif = {};
    notif.action = 'read';
    notif.all = true;
    const retour = apiCommunecter.postPixel('notification', 'update', notif);
    return retour;
  },
  allSeen () {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const notif = {};
    notif.action = 'seen';
    notif.all = true;
    const retour = apiCommunecter.postPixel('notification', 'update', notif);
    return retour;
  },
  isEmailValid(address) {
    check(address, String);

    // modify this with your key
    const result = HTTP.get('https://api.mailgun.net/v2/address/validate', {
      auth: `api:${Meteor.settings.mailgunpubkey}`,
      params: { address: address.trim() },
    });

    if (result.statusCode === 200) {
    // is_valid is the boolean we are looking for
      return result.data.is_valid;
    }
    // the api request failed (maybe the service is down)
    // consider giving the user the benefit of the doubt and return true
    return true;
  },
});

export const userLocale = new ValidatedMethod({
  name: 'userLocale',
  validate: new SimpleSchema({
    language: { type: String },
  }).validator(),
  run({ language }) {
    this.unblock();
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // console.log(language);
    if (Meteor.users.update({
      _id: this.userId,
    }, {
      $set: {
        'profile.language': language,
      },
    })) {
      return true;
    }

    return false;
  },
});

export const userDevice = new ValidatedMethod({
  name: 'userDevice',
  validate: new SimpleSchema({
    available: { type: Boolean },
    cordova: { type: String },
    model: { type: String },
    platform: { type: String },
    uuid: { type: String },
    version: { type: String },
    manufacturer: { type: String },
    isVirtual: { type: Boolean },
    serial: { type: String },
  }).validator(),
  run(device) {
    this.unblock();
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // console.log(device);
    if (Meteor.users.update({
      _id: this.userId,
    }, {
      $addToSet: {
        'profile.device': device,
      },
    })) {
      return true;
    }

    return false;
  },
});

export const updateRoles = new ValidatedMethod({
  name: 'updateRoles',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ modifier }) {
    SchemasRolesRest.clean(modifier);
    SchemasRolesRest.validate(modifier, { modifier: true });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const collection = nameToCollection(modifier.$set.contextType);
    if (!collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.contextId) }).isAdmin()) {
      throw new Meteor.Error('not-authorized');
    }
    const docRetour = modifier.$set;
    if (modifier && modifier.$set && modifier.$set.roles) {
      docRetour.roles = modifier.$set.roles.join(',');
    }

    const retour = apiCommunecter.postPixel('link', 'removerole', docRetour);
    return retour;
  },
});

export const insertRoom = new ValidatedMethod({
  name: 'insertRoom',
  validate: SchemasRoomsRest.validator(),
  run(doc) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // admin ou membre
    const collection = nameToCollection(doc.parentType);
    if (!(collection.findOne({ _id: new Mongo.ObjectID(doc.parentId) }).isAdmin() || Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(doc.parentType, doc.parentId))) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = doc;
    docRetour.status = 'open';
    if (doc && doc.roles) {
      docRetour.roles = doc.roles.join(',');
    }
    docRetour.key = 'room';
    docRetour.collection = 'rooms';

    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
});

export const updateRoom = new ValidatedMethod({
  name: 'updateRoom',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run({ modifier, _id }) {
    SchemasRoomsRest.clean(modifier);
    SchemasRoomsRest.validate(modifier, { modifier: true });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    // admin ou creator
    const collection = nameToCollection(modifier.$set.parentType);
    if (!(collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.parentId) }).isAdmin() || Rooms.findOne({ _id: new Mongo.ObjectID(_id) }).isCreator())) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = modifier.$set;
    if (modifier && modifier.$set && modifier.$set.roles) {
      docRetour.roles = modifier.$set.roles.join(',');
    }
    docRetour.status = 'open';
    docRetour.key = 'room';
    docRetour.collection = 'rooms';
    docRetour.id = _id;
    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
});

export const insertProposal = new ValidatedMethod({
  name: 'insertProposal',
  validate: SchemasProposalsRest.validator(),
  run(doc) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // membre ou membre avec roles si room à des roles
    const room = Rooms.findOne({ _id: new Mongo.ObjectID(doc.idParentRoom) });
    if (!room) {
      throw new Meteor.Error('not-authorized');
    } else {
      if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
        if (room.roles && room.roles.length > 0) {
            const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
            if (roles && room.roles.some(role => roles.includes(role))) {
              // true
            } else {
              // false
              throw new Meteor.Error('not-authorized');
            }
        }
      } else {
        throw new Meteor.Error('not-authorized');
      }
    }
    const docRetour = doc;
    docRetour.majority = doc.majority.toString();
    if (doc.amendementDateEnd) {
      docRetour.amendementDateEnd = moment(doc.amendementDateEnd).format('YYYY-MM-DDTHH:mm:ssZ');
    }
    if (doc.voteDateEnd) {
      docRetour.voteDateEnd = moment(doc.voteDateEnd).format('YYYY-MM-DDTHH:mm:ssZ');
    }
    docRetour.key = 'proposal';
    docRetour.collection = 'proposals';
    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
});

export const updateProposal = new ValidatedMethod({
  name: 'updateProposal',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run({ modifier, _id }) {
    SchemasProposalsRest.clean(modifier);
    SchemasProposalsRest.validate(modifier, { modifier: true });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Proposals.findOne({ _id: new Mongo.ObjectID(_id) })) {
      throw new Meteor.Error('not-authorized');
    }
    const collection = nameToCollection(modifier.$set.parentType);
    // admin ou creator
    if (!(collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.parentId) }).isAdmin() || Proposals.findOne({ _id: new Mongo.ObjectID(_id) }).isCreator())) {
      throw new Meteor.Error('not-authorized');
    }

    /* const room = Rooms.findOne({ _id: new Mongo.ObjectID(modifier.$set.idParentRoom) });
    if (!room) {
      throw new Meteor.Error('not-authorized');
    } else {
      if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
        if (room.roles && room.roles.length > 0) {
            const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
            if (roles && room.roles.some(role => roles.includes(role))) {
              // true
            } else {
              // false
              throw new Meteor.Error('not-authorized');
            }
        }
      } else {
        throw new Meteor.Error('not-authorized');
      }
    } */

    const docRetour = modifier.$set;
    docRetour.majority = modifier.$set.majority.toString();
    if (modifier.$set.amendementDateEnd) {
      docRetour.amendementDateEnd = moment(modifier.$set.amendementDateEnd).format();
    }
    if (modifier.$set.voteDateEnd) {
      docRetour.voteDateEnd = moment(modifier.$set.voteDateEnd).format();
    }
    docRetour.key = 'proposal';
    docRetour.collection = 'proposals';
    docRetour.id = _id;
    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
});

export const insertAction = new ValidatedMethod({
  name: 'insertAction',
  validate: SchemasActionsRest.validator(),
  run(doc) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // membre ou membre avec roles si room à des roles
    const room = Rooms.findOne({ _id: new Mongo.ObjectID(doc.idParentRoom) });
    if (!room) {
      throw new Meteor.Error('not-authorized');
    } else {
      if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
        if (room.roles && room.roles.length > 0) {
            const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
            if (roles && room.roles.some(role => roles.includes(role))) {
              // true
            } else {
              // false
              throw new Meteor.Error('not-authorized');
            }
        }
      } else {
        throw new Meteor.Error('not-authorized');
      }
    }

    const docRetour = doc;

    if (doc.startDate) {
      docRetour.startDate = moment(doc.startDate).format('YYYY-MM-DDTHH:mm:ssZ');
    }
    if (doc.endDate) {
      docRetour.endDate = moment(doc.endDate).format('YYYY-MM-DDTHH:mm:ssZ');
    }

    /*
    email:thomas.craipeau@gmail.com
    */
    docRetour.status = 'todo';
    docRetour.idUserAuthor = this.userId;
    docRetour.key = 'action';
    docRetour.collection = 'actions';
    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
});

export const updateAction = new ValidatedMethod({
  name: 'updateAction',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run({ modifier, _id }) {
    SchemasActionsRest.clean(modifier);
    SchemasActionsRest.validate(modifier, { modifier: true });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    if (!Actions.findOne({ _id: new Mongo.ObjectID(_id) })) {
      throw new Meteor.Error('not-authorized');
    }
    const collection = nameToCollection(modifier.$set.parentType);
    // admin ou creator
    if (!(collection.findOne({ _id: new Mongo.ObjectID(modifier.$set.parentId) }).isAdmin() || Actions.findOne({ _id: new Mongo.ObjectID(_id) }).isCreator())) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = modifier.$set;

    if (modifier.$set.startDate) {
      docRetour.startDate = moment(modifier.$set.startDate).format();
    }
    if (modifier.$set.endDate) {
      docRetour.endDate = moment(modifier.$set.endDate).format();
    }
    // docRetour.status = 'todo';
    docRetour.idUserAuthor = this.userId;
    docRetour.key = 'action';
    docRetour.collection = 'actions';
    docRetour.id = _id;
    const retour = apiCommunecter.postPixel('element', 'save', docRetour);
    return retour;
  },
});

export const insertAmendement = new ValidatedMethod({
  name: 'insertAmendement',
  validate: BlockProposalsRest.validator(),
  run(doc) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // membre ou membre avec roles si room à des roles
    const query = {};
    query._id = new Mongo.ObjectID(doc.id);
    const proposal = Proposals.findOne(query);
    if (!proposal) {
      throw new Meteor.Error('not-authorized');
    } else {
    const room = Rooms.findOne({ _id: new Mongo.ObjectID(proposal.idParentRoom) });
    if (!room) {
      throw new Meteor.Error('not-authorized');
    } else {
      if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
        if (room.roles && room.roles.length > 0) {
            const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
            if (roles && room.roles.some(role => roles.includes(role))) {
              // true
            } else {
              // false
              throw new Meteor.Error('not-authorized');
            }
        }
      } else {
        throw new Meteor.Error('not-authorized');
      }
    }
  }
    const docRetour = doc;

    /* block:amendement
    typeElement:proposals
    id:59d7450d40bb4e926fdcd10b
    txtAmdt:proposition amendement
    typeAmdt:add */

    const retour = apiCommunecter.postPixel('element', 'updateblock', docRetour);
    return retour;
  },
});

export const updateAmendement = new ValidatedMethod({
  name: 'updateAmendement',
  validate: new SimpleSchema({
    modifier: {
      type: Object,
      blackbox: true,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run({ modifier, _id }) {
    BlockProposalsRest.clean(modifier);
    BlockProposalsRest.validate(modifier, { modifier: true });

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = modifier.$set;
    docRetour.id = _id;
    const retour = apiCommunecter.postPixel('element', 'updateblock', docRetour);
    return retour;
  },
});

export const saveVote = new ValidatedMethod({
  name: 'saveVote',
  validate: new SimpleSchema({
    parentType: { type: String, allowedValues: ['amendement', 'proposal'] },
    parentId: { type: String },
    voteValue: { type: String, allowedValues: ['up', 'down', 'white', 'uncomplet'] },
    idAmdt: { type: String, optional: true },
  }).validator(),
  run({ parentType, parentId, voteValue, idAmdt }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // TODO verifier si user à droit de voter
    if (parentType === 'amendement' && !idAmdt) {
      throw new Meteor.Error('not-authorized');
    }

    const query = {};
    query._id = new Mongo.ObjectID(parentId);
    if (parentType === 'amendement' && idAmdt) {
      query[`amendements.${idAmdt}`] = { $exists: true };
    }
    const proposal = Proposals.findOne(query);
    if (!proposal) {
      throw new Meteor.Error('not-authorized');
    } else {
      const room = Rooms.findOne({ _id: new Mongo.ObjectID(proposal.idParentRoom) });
      if (!room) {
        throw new Meteor.Error('not-authorized');
      } else {
        if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
          if (room.roles && room.roles.length > 0) {
            const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
            if (roles && room.roles.some(role => roles.includes(role))) {
              // true
            } else {
              // false
              throw new Meteor.Error('not-authorized');
            }
          }
        } else {
          throw new Meteor.Error('not-authorized');
        }
      }
    }

    const docRetour = {};
    docRetour.parentType = parentType;
    docRetour.parentId = parentId;
    docRetour.voteValue = voteValue;
    if (parentType === 'amendement') {
      if (idAmdt) {
        docRetour.idAmdt = idAmdt;
      } else {
        throw new Meteor.Error('not-authorized');
      }
    }

    const retour = apiCommunecter.postPixel('cooperation', 'savevote', docRetour);
    return retour;
  },
});


export const assignmeActionRooms = new ValidatedMethod({
  name: 'assignmeActionRooms',
  validate: new SimpleSchema({
    id: { type: String },
  }).validator(),
  run({ id }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // TODO verifier si id est une room existante et les droit pour ce l'assigner
    //id action > recupérer idParentRoom,parentType,parentId > puis roles dans room
    const action = Actions.findOne({ _id: new Mongo.ObjectID(id) });
    if (!action) {
      throw new Meteor.Error('not-authorized');
    } else {
      const room = Rooms.findOne({ _id: new Mongo.ObjectID(action.idParentRoom) });
      if (!room) {
        throw new Meteor.Error('not-authorized');
      } else {
        if (Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).isScope(room.parentType, room.parentId)) {
          if (room.roles && room.roles.length > 0) {
            const roles = Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId) ? Citoyens.findOne({ _id: new Mongo.ObjectID(this.userId) }).funcRoles(room.parentType, room.parentId).split(',') : null;
            if (roles && room.roles.some(role => roles.includes(role))) {
              // true
            } else {
              // false
              throw new Meteor.Error('not-authorized');
            }
          }
        } else {
          throw new Meteor.Error('not-authorized');
        }
      }
    }

    const docRetour = {};
    docRetour.id = id;
    const retour = apiCommunecter.postPixel('rooms', 'assignme', docRetour);
    return retour;
  },
});

export const deleteAmendement = new ValidatedMethod({
  name: 'deleteAmendement',
  validate: new SimpleSchema({
    numAm: { type: String },
    idProposal: { type: String },
  }).validator(),
  run({ numAm, idProposal }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    // TODO verifier si idProposal est une proposition existante et numAm l'amendement existe
    const query = {};
    query._id = new Mongo.ObjectID(idProposal);
    query[`amendements.${numAm}`] = { $exists: true };
    const amendement = Proposals.findOne(query);
    if (!amendement) {
      throw new Meteor.Error('not-authorized');
    }
    // ou admin ou creator
    const collection = nameToCollection(amendement.parentType);
    if (!collection.findOne({ _id: new Mongo.ObjectID(amendement.parentId) }).isAdmin()) {
      if (amendement.amendements[numAm].idUserAuthor !== this.userId) {
        throw new Meteor.Error('not-authorized');
      }
    }

    const docRetour = {};
    docRetour.numAm = numAm;
    docRetour.idProposal = idProposal;
    const retour = apiCommunecter.postPixel('cooperation', 'deleteamendement', docRetour);
    return retour;
  },
});

export const actionsType = new ValidatedMethod({
  name: 'actionsType',
  validate: new SimpleSchema({
    parentType: { type: String, allowedValues: ['projects', 'organizations', 'events'] },
    parentId: { type: String },
    type: { type: String, allowedValues: ['actions', 'proposals'] },
    id: { type: String },
    name: { type: String, allowedValues: ['status'] },
    value: { type: String, allowedValues: ['done', 'disabled', 'amendable', 'tovote'] },
  }).validator(),
  run({ parentType, parentId, type, id, name, value }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    const collection = nameToCollection(parentType);
    const collectionType = nameToCollection(type);

    if (!collectionType.findOne({ _id: new Mongo.ObjectID(id) })) {
      throw new Meteor.Error('not-authorized');
    }

    if (!(collection.findOne({ _id: new Mongo.ObjectID(parentId) }).isAdmin() || collectionType.findOne({ _id: new Mongo.ObjectID(id) }).isCreator())) {
      throw new Meteor.Error('not-authorized');
    }

    const docRetour = {};
    docRetour.parentType = parentType;
    docRetour.parentId = parentId;
    docRetour.type = type;
    docRetour.id = id;
    docRetour.name = name;
    docRetour.value = value;
    const retour = apiCommunecter.postPixel('element', 'updatefield', docRetour);
    return retour;
  },
});
