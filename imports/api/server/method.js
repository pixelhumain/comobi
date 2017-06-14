import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { Push } from 'meteor/raix:push';
import { moment } from 'meteor/momentjs:moment';
import { URL } from 'meteor/url';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
//collection et schemas
//import { NotificationHistory } from '../notification_history.js';
import { ActivityStream } from '../activitystream.js';
import { Citoyens,BlockCitoyensRest,SchemasCitoyensRest,SchemasFollowRest,SchemasInviteAttendeesEventRest } from '../citoyens.js';
import { News,SchemasNewsRest,SchemasNewsRestBase } from '../news.js';
import { Documents } from '../documents.js';
import { Cities } from '../cities.js';
import { Lists } from '../lists.js';
import { Events,SchemasEventsRest,BlockEventsRest } from '../events.js';
import { Organizations,SchemasOrganizationsRest,BlockOrganizationsRest } from '../organizations.js';
import { Projects,SchemasProjectsRest,BlockProjectsRest } from '../projects.js';
import { Poi,SchemasPoiRest,BlockPoiRest } from '../poi.js';
import { Classified,SchemasClassifiedRest } from '../classified.js';
import { Comments,SchemasCommentsRest,SchemasCommentsEditRest } from '../comments.js';
import { SchemasShareRest } from '../schema.js';

//function api
import { apiCommunecter } from './api.js';

//helpers
import { encodeString } from '../helpers.js';
import { ValidEmail,IsValidEmail } from 'meteor/froatsnook:valid-email';

import { nameToCollection } from '../helpers.js';

global.Events = Events;
global.Organizations = Organizations;
global.Projects = Projects;
global.Poi = Poi;
global.Classified = Classified;
global.Citoyens = Citoyens;

const baseDocRetour = (docRetour,doc,scope) => {

if(scope === 'block'){
if(doc.typeElement === 'citoyens'){
  if(doc.block === 'descriptions'){
    docRetour.description = doc.description ? doc.description : '';
    docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
    docRetour.tags = doc.tags ? doc.tags : '';
  }
  if(doc.block === 'network'){
    docRetour.telegram = doc.telegram ? doc.telegram : '';
    docRetour.skype = doc.skype ? doc.skype : '';
    docRetour.github = doc.github ? doc.github : '';
    docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
    docRetour.twitter = doc.twitter ? doc.twitter : '';
    docRetour.facebook = doc.facebook ? doc.facebook : '';
  }
  if(doc.block === 'info'){
    docRetour.name = doc.name;
    docRetour.email = doc.email;
    docRetour.url = doc.url ? doc.url : '';
    docRetour.fixe = doc.fixe ? doc.fixe : '';
    docRetour.mobile = doc.mobile ? doc.mobile : '';
    docRetour.fax = doc.fax ? doc.fax : '';
    docRetour.birthDate = doc.birthDate ? moment(doc.birthDate).format() : '';
  }
  if(doc.block === 'preferences'){

  }
}else if(doc.typeElement === 'events'){
  if(doc.block === 'descriptions'){
    docRetour.description = doc.description ? doc.description : '';
    docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
    docRetour.tags = doc.tags ? doc.tags : '';
  }
  if(doc.block === 'network'){
    docRetour.instagram = doc.instagram ? doc.instagram : '';
    docRetour.skype = doc.skype ? doc.skype : '';
    docRetour.github = doc.github ? doc.github : '';
    docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
    docRetour.twitter = doc.twitter ? doc.twitter : '';
    docRetour.facebook = doc.facebook ? doc.facebook : '';
  }
  if(doc.block === 'info'){
    docRetour.name = doc.name;
    docRetour.type = doc.type;
    docRetour.email = doc.email ? doc.email : '';
    docRetour.url = doc.url ? doc.url : '';
    docRetour.fixe = doc.fixe ? doc.fixe : '';
    docRetour.mobile = doc.mobile ? doc.mobile : '';
    docRetour.fax = doc.fax ? doc.fax : '';
  }
  if(doc.block === 'when'){
    docRetour.allDay = doc.allDay;
    docRetour.startDate=moment(doc.startDate).format();
    docRetour.endDate=moment(doc.endDate).format();
  }
}else if(doc.typeElement === 'projects'){
  if(doc.block === 'descriptions'){
    docRetour.description = doc.description ? doc.description : '';
    docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
    docRetour.tags = doc.tags ? doc.tags : '';
  }
  if(doc.block === 'network'){
    docRetour.instagram = doc.instagram ? doc.instagram : '';
    docRetour.skype = doc.skype ? doc.skype : '';
    docRetour.github = doc.github ? doc.github : '';
    docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
    docRetour.twitter = doc.twitter ? doc.twitter : '';
    docRetour.facebook = doc.facebook ? doc.facebook : '';
  }
  if(doc.block === 'info'){
    docRetour.name = doc.name;
    docRetour.avancement = doc.avancement ? doc.avancement : '';
    docRetour.email = doc.email ? doc.email : '';
    docRetour.url = doc.url ? doc.url : '';
    docRetour.fixe = doc.fixe ? doc.fixe : '';
    docRetour.mobile = doc.mobile ? doc.mobile : '';
    docRetour.fax = doc.fax ? doc.fax : '';
  }
  if(doc.block === 'when'){
    docRetour.startDate=moment(doc.startDate).format();
    docRetour.endDate=moment(doc.endDate).format();
  }
}else if(doc.typeElement === 'poi'){
  if(doc.block === 'descriptions'){
    docRetour.description = doc.description ? doc.description : '';
    docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
    docRetour.tags = doc.tags ? doc.tags : '';
  }
  if(doc.block === 'info'){
    docRetour.name = doc.name;
  }
}else if(doc.typeElement === 'organizations'){
  if(doc.block === 'descriptions'){
    docRetour.description = doc.description ? doc.description : '';
    docRetour.shortDescription = doc.shortDescription ? doc.shortDescription : '';
    docRetour.tags = doc.tags ? doc.tags : '';
  }
  if(doc.block === 'network'){
    docRetour.instagram = doc.instagram ? doc.instagram : '';
    docRetour.skype = doc.skype ? doc.skype : '';
    docRetour.github = doc.github ? doc.github : '';
    docRetour.gpplus = doc.gpplus ? doc.gpplus : '';
    docRetour.twitter = doc.twitter ? doc.twitter : '';
    docRetour.facebook = doc.facebook ? doc.facebook : '';
  }
  if(doc.block === 'info'){
    docRetour.name = doc.name;
    docRetour.type = doc.type;
    docRetour.email = doc.email ? doc.email : '';
    docRetour.url = doc.url ? doc.url : '';
    docRetour.fixe = doc.fixe ? doc.fixe : '';
    docRetour.mobile = doc.mobile ? doc.mobile : '';
    docRetour.fax = doc.fax ? doc.fax : '';
  }
}
} else if(scope === 'events'){
  docRetour.name = doc.name;
  //docRetour.description = doc.description ? doc.description : '';
  if(doc.description){
  docRetour.description = doc.description;
  }
  if(doc.shortDescription){
  docRetour.shortDescription = doc.shortDescription;
  }
  docRetour.type = doc.type;
  docRetour.allDay = doc.allDay;
  docRetour.startDate=moment(doc.startDate).format();
  docRetour.endDate=moment(doc.endDate).format();
  docRetour.organizerId = doc.organizerId;
  docRetour.organizerType = doc.organizerType;
  docRetour.tags = doc.tags ? doc.tags : '';
  if(doc.parentId){
  docRetour.parentId = doc.parentId;
  }
  if(doc.preferences){
  docRetour.preferences = doc.preferences;
  }
} else if(scope === 'organizations'){
  docRetour.name = doc.name;
  docRetour.description = doc.description ? doc.description : '';
  docRetour.type = doc.type;
  docRetour.role = doc.role;
  docRetour.email = doc.email ? doc.email : '';
  docRetour.url = doc.url ? doc.url : '';
  if(doc.preferences){
  docRetour.preferences = doc.preferences;
  }
} else if(scope === 'projects'){
  docRetour.name = doc.name;
  docRetour.description = doc.description ? doc.description : '';
  docRetour.url = doc.url ? doc.url : '';
  docRetour.startDate = doc.startDate ? moment(doc.startDate).format() : '';
  docRetour.endDate= doc.endDate ? moment(doc.endDate).format() : '';
  docRetour.parentId = doc.parentId;
  docRetour.parentType = doc.parentType;
  if(doc.preferences){
  docRetour.preferences = doc.preferences;
  }
} else if(scope === 'poi'){
  docRetour.name = doc.name;
  docRetour.description = doc.description ? doc.description : '';
  docRetour.url = doc.url ? doc.url : '';
  docRetour.parentId = doc.parentId;
  docRetour.parentType = doc.parentType;
} else if(scope === 'classified'){
  docRetour.name = doc.name;
  docRetour.description = doc.description ? doc.description : '';
  docRetour.url = doc.url ? doc.url : '';
  docRetour.parentId = doc.parentId;
  docRetour.parentType = doc.parentType;
} else {
  if(doc.name){
  docRetour.name = doc.name;
  }
  if(doc.description){
  docRetour.description = doc.description;
  }
  if(doc.shortDescription){
  docRetour.shortDescription = doc.shortDescription;
  }
  if(doc.startDate){
    docRetour.startDate=moment(doc.startDate).format();
  }
  if(doc.endDate){
    docRetour.endDate=moment(doc.endDate).format();
  }
  if(doc.allDay){
  docRetour.allDay = doc.allDay;
  }
  if(doc.organizerId){
  docRetour.organizerId = doc.organizerId;
  }
  if(doc.organizerType){
  docRetour.organizerType = doc.organizerType;
  }
  if(doc.type){
  docRetour.type = doc.type;
  }
  if(doc.role){
  docRetour.role = doc.role;
  }
  if(doc.email){
  docRetour.email = doc.email;
  }
  if(doc.url){
  docRetour.url = doc.url;
  }
  if(doc.tags){
  docRetour.tags = doc.tags;
  }
}

  /*if(doc.preferences){
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
  }*/

  if(doc.block === 'locality'){
    docRetour.name = 'locality';
    docRetour.value = {};
    docRetour.value.unikey = `${doc.country}_${doc.city}-${doc.postalCode}`;
    docRetour.value.address = {};
    docRetour.value.address['@type'] = 'PostalAddress';
    docRetour.value.address['addressCountry'] = doc.country;
    docRetour.value.address['postalCode'] = doc.postalCode;
    docRetour.value.address['codeInsee'] = doc.city;
    docRetour.value.address['addressLocality'] = doc.cityName;
    docRetour.value.address['regionName'] = doc.regionName;
    docRetour.value.address['depName'] = doc.depName;
    if(doc.streetAddress){
      docRetour.value.address['streetAddress'] = doc.streetAddress;
    }
    if(doc.geoPosLatitude && doc.geoPosLongitude){
      docRetour.value.geo = {};
      docRetour.value.geo['latitude'] = doc.geoPosLatitude;
      docRetour.value.geo['longitude'] = doc.geoPosLongitude;
      docRetour.value.geo['@type'] = 'GeoCoordinates';
      docRetour.value.geoPosition = {};
      docRetour.value.geoPosition['type'] = 'Point';
      docRetour.value.geoPosition['coordinates'] = [parseFloat(doc.geoPosLongitude),parseFloat(doc.geoPosLatitude)];
    }
  } else {
    if(doc.country || doc.postalCode || doc.city || doc.cityName || doc.regionName || doc.depName || doc.streetAddress){
    docRetour.address = {};
    docRetour.address['@type'] = 'PostalAddress';
    docRetour.address['addressCountry'] = doc.country;
    docRetour.address['postalCode'] = doc.postalCode;
    docRetour.address['codeInsee'] = doc.city;
    docRetour.address['addressLocality'] = doc.cityName;
    docRetour.address['regionName'] = doc.regionName;
    docRetour.address['depName'] = doc.depName;
    if(doc.streetAddress){
      docRetour.address['streetAddress'] = doc.streetAddress;
    }
  }
    if(doc.geoPosLatitude && doc.geoPosLongitude){
      docRetour.geo = {};
      docRetour.geo['latitude'] = doc.geoPosLatitude;
      docRetour.geo['longitude'] = doc.geoPosLongitude;
      docRetour.geo['@type'] = 'GeoCoordinates';
      docRetour.geoPosition = {};
      docRetour.geoPosition['type'] = 'Point';
      docRetour.geoPosition['coordinates'] = [parseFloat(doc.geoPosLongitude),parseFloat(doc.geoPosLatitude)];
    }
  }

  return docRetour;
}

URL._encodeParams = function(params, prefix) {
  var str = [];
  for(var p in params) {
    if (params.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = params[p];
      if(typeof v === "object") {
        str.push(this._encodeParams(v, k));
      } else {
        var encodedKey = encodeString(k).replace('%5B', '[').replace('%5D', ']');
        str.push(encodedKey + "=" + encodeString(v));
      }
    }
  }
  return str.join("&").replace(/%20/g, '+');
};

Meteor.methods({
  userup (geo) {
    check(geo, {longitude:Number,latitude:Number});
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (Citoyens.update({
      _id: new Mongo.ObjectID(this.userId)
    }, {
      $set: {
        'geoPosition': {
          type: "Point",
          'coordinates': [parseFloat(geo.longitude), parseFloat(geo.latitude)]
        }
      }
    })) {
      return true;
    } else {
      return false;
    }
    this.unblock();
  },
  likeScope (newsId,scope) {
    check(newsId, String);
    check(scope, String);
    check(scope, Match.Where(function(name) {
      return _.contains(['news', 'comments'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    let doc={};
    doc.id=newsId;
    doc.collection=scope;
    doc.action="voteUp";
    let voteQuery={};
    voteQuery["_id"] = new Mongo.ObjectID(newsId);
    voteQuery['voteUp.'+this.userId]={$exists:true};

    if (News.findOne(voteQuery)) {
      doc.unset="true";
      Meteor.call('addAction',doc);

    } else {
      let voteQuery={};
      voteQuery["_id"] = new Mongo.ObjectID(newsId);
      voteQuery['voteDown.'+this.userId]={$exists:true};

      if (News.findOne(voteQuery)) {
        let rem={};
        rem.id=newsId;
        rem.collection="news";
        rem.action="voteDown";
        rem.unset="true";
        Meteor.call('addAction',rem);

      }
      Meteor.call('addAction',doc);

    }
  },
  dislikeScope (newsId,scope) {
    check(newsId, String);
    check(scope, String);
    check(scope, Match.Where(function(name) {
      return _.contains(['news', 'comments'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    let doc={};
    doc.id=newsId;
    doc.collection=scope;
    doc.action="voteDown";
    let voteQuery={};
    voteQuery["_id"] = new Mongo.ObjectID(newsId);
    voteQuery['voteDown.'+this.userId]={$exists:true};

    if (News.findOne(voteQuery)) {
      doc.unset="true";
      Meteor.call('addAction',doc);
    } else {

      let voteQuery={};
      voteQuery["_id"] = new Mongo.ObjectID(newsId);
      voteQuery['voteUp.'+this.userId]={$exists:true};

      if (News.findOne(voteQuery)) {
        let rem={};
        rem.id=newsId;
        rem.collection="news";
        rem.action="voteUp";
        rem.unset="true";
        Meteor.call('addAction',rem);
      }
      Meteor.call('addAction',doc);

    }
  },
  addAction (doc){
    check(doc.id, String);
    check(doc.collection, String);
    check(doc.action, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    var retour = apiCommunecter.postPixel("action","addaction",doc);
    return retour;
  },
  followPersonExist (connectUserId){
    //type : person / follows
    //connectUserId
    check(connectUserId, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    let doc={};
    doc.connectUserId=connectUserId;
    var retour = apiCommunecter.postPixel("person","follows",doc);
    return retour;
  },
  followPerson (doc){
    //type : person / follows
    //invitedUserName
    //invitedUserEmail
    check(doc, SchemasFollowRest);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    var retour = apiCommunecter.postPixel("person","follows",doc);
    return retour;
  },
  saveattendeesEvent (eventId,email,inviteUserId){
    check(eventId, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    let doc={};
    doc.parentId=eventId;
    doc.parentType='events';
    doc.childType="citoyens";
    if(typeof email !== 'undefined'){
    doc.childId=Citoyens.findOne({email:email.toLowerCase()})._id._str;
    }else{
      if (typeof inviteUserId !== 'undefined' && inviteUserId) {
        doc.childId=inviteUserId;
      } else {
        doc.childId=this.userId;
      }
    }
    var retour = apiCommunecter.postPixel("link","connect",doc);
    return retour;
  },
followEntity (connectId,parentType,childId){
  check(connectId, String);
  check(parentType, String);
  check(parentType, Match.Where(function(name) {
    return _.contains(['events', 'projects','organizations','citoyens'], name);
  }));
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  let doc={};

  doc.parentId=connectId;
  doc.childType="citoyens";

  /*if(parentType=="organizations"){
  doc.connectType="member";
  }else if(parentType=="projects"){
  doc.connectType="contributor";
  }else if(parentType=="citoyens"){
  doc.connectType="followers";
}*/

  doc.childId = (typeof childId !== 'undefined') ?  childId : this.userId;
  doc.parentType=parentType;
  var retour = apiCommunecter.postPixel("link","follow",doc);
  return retour;
},
shareEntity (doc){
  console.log(doc);
    check(doc, SchemasShareRest);
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  doc.childType="citoyens";
  doc.connectType="share";
  doc.childId = this.userId;
  var retour = apiCommunecter.postPixel("news","share",doc);
  return retour;
},
collectionsAdd (id,type){
  check(id, String);
  check(type, String);
  check(type, Match.Where(function(name) {
    return _.contains(['events', 'projects','organizations','citoyens','poi','classified'], name);
  }));
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  let doc={};
  doc.id=id;
  doc.type=type;
  doc.collection='favorites';
  var retour = apiCommunecter.postPixel("collections","add",doc);
  return retour;
},
  connectEntity (connectId,parentType,childId){
    check(connectId, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    let doc={};
    doc.parentId=connectId;
    doc.childType="citoyens";
    if(parentType=="organizations"){
    doc.connectType="member";
    }else if(parentType=="projects"){
    doc.connectType="contributor";
    }else if(parentType=="citoyens"){
    doc.connectType="followers";
    }else if(parentType=="events"){
    doc.connectType="attendee";
    }
    doc.childId = (typeof childId !== 'undefined') ?  childId : this.userId;
    doc.parentType=parentType;
    var retour = apiCommunecter.postPixel("link","connect",doc);
    return retour;
  },
  disconnectEntity (connectId,parentType,connectType,childId,childType){
    check(connectId, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    /*childId:5534fd9da1aa14201b0041cb
    childType:citoyens
    parentType:projects
    parentId:590c5877dd0452330ca1fa1f
    connectType:followers*/


    let doc={};
    doc.parentId=connectId;
    doc.childType = (typeof childType !== 'undefined' && childType !== null) ?  childType : 'citoyens';
    if(parentType=="organizations"){
    doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ?  connectType : 'members';
    }else if(parentType=="projects"){
    doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ?  connectType : 'contributors';
    }else if(parentType=="citoyens"){
    doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ?  connectType : 'followers';
    }else if(parentType=="events"){
    doc.connectType = (typeof connectType !== 'undefined' && connectType !== null) ?  connectType : 'attendees';
    }
    doc.childId = (typeof childId !== 'undefined' && childId !== null) ?  childId : this.userId;
    doc.parentType=parentType;
    console.log(doc);
    var retour = apiCommunecter.postPixel("link","disconnect",doc);
    return retour;
  },
  validateEntity (parentId,parentType,childId,childType,linkOption){
    check(parentId, String);
    check(childId, String);
    check(childType, String);
    check(linkOption, String);
    check(parentType, String);
    check(parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens'], name);
    }));
    check(childType, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    const collection = nameToCollection(parentType);
    if(!collection.findOne({_id:new Mongo.ObjectID(parentId)}).isAdmin(this.userId)){
      throw new Meteor.Error("not-authorized");
    }

    let doc={};
    doc.parentId = parentId;
    doc.parentType=parentType;
    doc.childId = childId;
    doc.childType = childType;
    doc.linkOption = linkOption;
    var retour = apiCommunecter.postPixel("link","validate",doc);
    return retour;
  },
  inviteattendeesEvent (doc){
    check(doc, SchemasInviteAttendeesEventRest);
    check(doc.invitedUserEmail,ValidEmail);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    if (!Meteor.call('isEmailValid',doc.invitedUserEmail)) {
      throw new Meteor.Error("Email not valid");
    }
    let insertDoc={};
    insertDoc.parentId=doc.eventId;
    insertDoc.parentType='events';
    insertDoc.childType="citoyens";
    insertDoc.childEmail=doc.invitedUserEmail;
    insertDoc.childName=doc.invitedUserName;
    insertDoc.connectType="attendees";
    insertDoc.childId="";
    let retour = apiCommunecter.postPixel("link","connect",insertDoc);
    return retour;
  },
  checkUsername (username){
    check(username, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (Citoyens.findOne({_id:new Mongo.ObjectID(this.userId)}).username !== username) {
      const responsePost = HTTP.call( 'POST', `${Meteor.settings.endpoint}/${Meteor.settings.module}/person/checkusername`, {
        params: {username: username}
      });
      console.log(responsePost.data);
      return responsePost.data;
    }else{
      return true
    }
  },
  searchTagautocomplete (query, options){
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
    var regex = new RegExp("^" + query);
    //List.find({$or : [{name: {$regex:  regex, $options: "i"}},{'postalCodes.postalCode': {$regex:  regex}}]}, options).fetch();
    return Lists.findOne({name:'tags'}).list;
  },
  searchMemberautocomplete (search){
    check(search, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    const query = {search: search};
    var retour = apiCommunecter.postPixelMethod("search","searchmemberautocomplete",query);
    console.log(retour);
    return retour.data;
  },
  searchGlobalautocomplete (search){
    check(search, Object);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    /*name:syl
locality:
searchType[]:persons
searchType[]:organizations
searchType[]:projects
searchType[]:events
searchType[]:cities
searchBy:ALL
indexMin:0
indexMax:20*/
    search.indexMin = 0;
    search.indexMax= 20;
    var retour = apiCommunecter.postPixelMethod("search","globalautocomplete",search);
    return retour.data;
  },
  updateSettings (type,value,typeEntity,idEntity){
    check(type, String);
    check(typeEntity, String);
    check(idEntity, String);
    check(typeEntity, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    if(typeEntity=="organizations" || typeEntity=="projects" || typeEntity=="events"){
      const collection = nameToCollection(typeEntity);
      if (!collection.findOne({_id:new Mongo.ObjectID(idEntity)}).isAdmin()) {
        throw new Meteor.Error("not-authorized");
      }
      check(type, Match.Where(function(name) {
        return _.contains(['isOpenData','isOpenEdition'], name);
      }));
      check(value, Boolean);
    }else if(typeEntity=="citoyens"){
      if (this.userId !== idEntity ) {
        throw new Meteor.Error("not-authorized");
      }
      check(type, Match.Where(function(name) {
        return _.contains(['directory', 'birthDate','email','locality','phone','isOpenData'], name);
      }));
      if(type=='isOpenData'){
        check(value, Boolean);
      }else{
        check(value, Match.Where(function(name) {
          return _.contains(['public', 'private','hide'], name);
        }));
      }

    }

    const doc={};
    doc.typeEntity=typeEntity;
    doc.type=type;
    doc.idEntity=idEntity;
    doc.value=value;

    var retour = apiCommunecter.postPixel("element","updatesettings",doc);
    return retour;
  },
  insertComment (doc){
      check(doc, SchemasCommentsRest);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(!doc.parentCommentId){
      doc.parentCommentId = "";
    }
    var retour = apiCommunecter.postPixel("comment","save",doc);
    return retour;
  },
  updateComment (modifier,documentId){
      check(modifier["$set"], SchemasCommentsEditRest);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (!Comments.findOne({_id:documentId}).isAuthor()) {
      throw new Meteor.Error("not-authorized");
    }
    const doc = {};
    doc.id = documentId;
    doc.content = modifier["$set"].text;
    doc.contextId = modifier["$set"].contextId;
    doc.contextType = modifier["$set"].contextType;
    if(modifier["$set"].parentCommentId){
      doc.parentCommentId = modifier["$set"].parentCommentId;
    }else{
      doc.parentCommentId = "";
    }
    var retour = apiCommunecter.postPixel("comment","save",doc);
    return retour;
  },
  deleteComment (commentId) {
    check(commentId, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    if (!Comment.findOne({_id:new Mongo.ObjectID(commentId)}).isAuthor()) {
      throw new Meteor.Error("not-authorized");
    }

  const retour = apiCommunecter.postPixel("comment",`delete/id/${commentId}`,{});
  return retour;
},
updateBlock (modifier,documentId){
  check(modifier["$set"].typeElement, Match.Where(function(name) {
    return _.contains(['events', 'projects','poi','organizations','citoyens'], name);
  }));

  if(modifier["$set"].typeElement=="organizations" || modifier["$set"].typeElement=="projects" || modifier["$set"].typeElement=="poi" || modifier["$set"].typeElement=="events"){
    const collection = nameToCollection(modifier["$set"].typeElement);
    if (!collection.findOne({_id:new Mongo.ObjectID(documentId)}).isAdmin()) {
      throw new Meteor.Error("not-authorized");
    }
  }else if(modifier["$set"].typeElement=="citoyens"){
    if (this.userId !== documentId ) {
      throw new Meteor.Error("not-authorized");
    }
  }

  if(modifier["$set"].typeElement === 'citoyens'){
    check(modifier["$set"].block, Match.Where(function(name) {
      return _.contains(['descriptions','network','info','locality','preferences'], name);
    }));
    //block description,contact,info
    BlockCitoyensRest[modifier["$set"].block].clean(modifier["$set"]);
    check(modifier["$set"], BlockCitoyensRest[modifier["$set"].block]);
  } else if(modifier["$set"].typeElement === 'events'){
    check(modifier["$set"].block, Match.Where(function(name) {
      return _.contains(['descriptions','network','info','when','locality','preferences'], name);
    }));
    //block description,contact,info,when
    BlockEventsRest[modifier["$set"].block].clean(modifier["$set"]);
    check(modifier["$set"], BlockEventsRest[modifier["$set"].block]);
  } else if(modifier["$set"].typeElement === 'organizations'){
    check(modifier["$set"].block, Match.Where(function(name) {
      return _.contains(['descriptions','network','info','locality','preferences'], name);
    }));
    //block description,contact,info,when
    BlockOrganizationsRest[modifier["$set"].block].clean(modifier["$set"]);
    check(modifier["$set"], BlockOrganizationsRest[modifier["$set"].block]);
  } else if(modifier["$set"].typeElement === 'projects'){
    check(modifier["$set"].block, Match.Where(function(name) {
      return _.contains(['descriptions','network','info','when','locality','preferences'], name);
    }));
    //block description,contact,info,when
    BlockProjectsRest[modifier["$set"].block].clean(modifier["$set"]);
    check(modifier["$set"], BlockProjectsRest[modifier["$set"].block]);
  } else if(modifier["$set"].typeElement === 'poi'){
    check(modifier["$set"].block, Match.Where(function(name) {
      return _.contains(['descriptions','info','locality','preferences'], name);
    }));
    //block description,contact,info,when
    BlockProjectsRest[modifier["$set"].block].clean(modifier["$set"]);
    check(modifier["$set"], BlockProjectsRest[modifier["$set"].block]);
  }

  const docRetour = baseDocRetour({},modifier["$set"],'block');
  if(modifier["$set"].typeElement === 'citoyens' && modifier["$set"].block === 'info'){
    if (Citoyens.findOne({_id:new Mongo.ObjectID(this.userId)}).username !== modifier["$set"].username) {
      docRetour.username = modifier["$set"].username;
    }
  }
  if(modifier["$set"].block === 'locality'){
    docRetour.pk = documentId;
    docRetour.type = modifier["$set"].typeElement;
    console.log(docRetour);
    var retour = apiCommunecter.postPixel("element",`updatefields/type/${modifier["$set"].typeElement}`,docRetour);
    return retour;
  }else if(modifier["$set"].block === 'preferences'){
    console.log('preferences');
    if(modifier["$set"].typeElement === 'citoyens'){
      const fieldsArray = ['email','locality','phone','directory','birthDate','isOpenData'];
        _.each(fieldsArray, (field) => {
          console.log(`updateSettings,${field},${modifier["$set"][`preferences.${field}`]},${modifier["$set"].typeElement},${documentId}`);
          Meteor.call('updateSettings',field,modifier["$set"][`preferences.${field}`],modifier["$set"].typeElement,documentId);
        });
    } else if(modifier["$set"].typeElement=="organizations" || modifier["$set"].typeElement=="projects" || modifier["$set"].typeElement=="events"){
      const fieldsArray = ['isOpenEdition','isOpenData'];
        _.each(fieldsArray, (field) => {
          console.log(`updateSettings,${field},${modifier["$set"][`preferences.${field}`]},${modifier["$set"].typeElement},${documentId}`);
          Meteor.call('updateSettings',field,modifier["$set"][`preferences.${field}`],modifier["$set"].typeElement,documentId);
        });
    }
    return true;
  }else{
    docRetour.id = documentId;
    docRetour.block = modifier["$set"].block;
    docRetour.typeElement = modifier["$set"].typeElement;
    console.log(docRetour);
    var retour = apiCommunecter.postPixel("element","updateblock",docRetour);
    return retour;
  }

},
updateCitoyen (modifier,documentId){
  SchemasCitoyensRest.clean(modifier["$set"]);
  check(modifier["$set"], SchemasCitoyensRest);
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  if (this.userId !== documentId ) {
    throw new Meteor.Error("not-authorized");
  }

  const docRetour = baseDocRetour({},modifier["$set"],'citoyens');
  docRetour.id = documentId;
  docRetour.key='citoyen';
  docRetour.collection='citoyens';

  console.log(docRetour);

  var retour = apiCommunecter.postPixel("element","save",docRetour);
  return retour;
},
  insertNew (doc){
      check(doc.parentType, Match.Where(function(name) {
        return _.contains(['events', 'projects','organizations','citoyens'], name);
      }));
      check(doc,SchemasNewsRestBase[doc.parentType]);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(doc.parentType === 'citoyens'){
      if (this.userId !== doc.parentId) {
        throw new Meteor.Error("not-authorized");
      }
      if(!doc.scope){
        doc.scope="restricted";
      }
    } else if(doc.parentType === 'organizations'){
      const collection = nameToCollection(doc.parentType);
      const autorize = collection.findOne({_id:new Mongo.ObjectID(doc.parentId)});
      if (autorize.isAdmin() || autorize.isMembers(this.userId)) {
      }else{
        throw new Meteor.Error("not-authorized");
      }
      if(!doc.scope){
        doc.scope="restricted";
      }
    } else if(doc.parentType === 'projects'){
      const collection = nameToCollection(doc.parentType);
      const autorize = collection.findOne({_id:new Mongo.ObjectID(doc.parentId)});
      if (autorize.isAdmin() || autorize.isContributors(this.userId)) {
      }else{
        throw new Meteor.Error("not-authorized");
      }
      if(!doc.scope){
        doc.scope="restricted";
      }
    } else if(doc.parentType === 'events'){
      const collection = nameToCollection(doc.parentType);
      const autorize = collection.findOne({_id:new Mongo.ObjectID(doc.parentId)});
      if (autorize.isAdmin() || autorize.isAttendees(this.userId)) {
      }else{
        throw new Meteor.Error("not-authorized");
      }
      if(!doc.scope){
        doc.scope="restricted";
      }
    }

    var retour = apiCommunecter.postPixel("news","save",doc);
    return retour;
  },
  updateNew (modifier,documentId){
    check(modifier["$set"].parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens'], name);
    }));
    //check(modifier["$set"], SchemasNewsRest);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (!News.findOne({_id:new Mongo.ObjectID(documentId)}).isAuthor()) {
      throw new Meteor.Error("not-authorized");
    }

    const doc = modifier["$set"];
    doc.id = documentId;
    var retour = apiCommunecter.postPixel("news","save",doc);
    return retour;
  },
  updateNewOld (modifier,documentId){
    check(modifier["$set"], SchemasNewsRest);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (!News.findOne({_id:documentId}).isAuthor()) {
      throw new Meteor.Error("not-authorized");
    }

    let updateNew = {};
    updateNew.name = 'newsContent'+documentId._str;
    updateNew.value = modifier["$set"].text;
    updateNew.pk = documentId._str;

    var retour = apiCommunecter.postPixel("news","updatefield",updateNew);
    return retour;
  },
  deleteNew (newsId) {
    check(newsId, String);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    if (!News.findOne({_id:new Mongo.ObjectID(newsId)}).isAuthor()) {
      throw new Meteor.Error("not-authorized");
    }

const newsOne = News.findOne({_id:new Mongo.ObjectID(newsId)});
if(newsOne &&newsOne.media && newsOne.media.images){
  let arrayId = newsOne.media.images.map((_id) => {
    return new Mongo.ObjectID(_id)
  })
  const newsDocs = Documents.find({
    _id : { $in: arrayId }
  });
  newsDocs.forEach((newsDoc) => {
    const doc = {};
    doc.name=newsDoc.name;
doc.parentId=newsOne.target.id;
doc.parentType=newsOne.target.type;
doc.path=newsDoc.path;
doc.docId=newsDoc._id._str;
  apiCommunecter.postPixel("document",`delete/dir/${Meteor.settings.module}/type/${newsOne.target.type}/parentId/${newsOne.target.id}`,doc);
});
}
  const retour = apiCommunecter.postPixel("news",`delete/id/${newsId}`,{});
  return retour;
},
  photoNews (photo,str,type,idType,newsId) {
    check(str, String);
    check(type, String);
    check(idType, String);
    check(newsId, Match.Maybe(String));
    check(type, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens','poi','classified'], name);
    }));
    const collection = nameToCollection(type);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(type === 'citoyens'){
      if (this.userId !== idType) {
        throw new Meteor.Error("not-authorized");
      }
    } else if(type === 'projects'){
      if (!collection.findOne({_id:new Mongo.ObjectID(idType)}).isAdmin()) {
      if (!collection.findOne({_id:new Mongo.ObjectID(idType)}).isContributors(this.userId)) {
        throw new Meteor.Error("not-authorized");
      }
    }
    } else if(type === 'organizations'){
      if (!collection.findOne({_id:new Mongo.ObjectID(idType)}).isAdmin()) {
      if (!collection.findOne({_id:new Mongo.ObjectID(idType)}).isMembers(this.userId)) {
        throw new Meteor.Error("not-authorized");
      }
    }
  } else if(type === 'events'){
    if (!collection.findOne({_id:new Mongo.ObjectID(idType)}).isAdmin()) {
    if (!collection.findOne({_id:new Mongo.ObjectID(idType)}).isAttendees(this.userId)) {
      throw new Meteor.Error("not-authorized");
    }
  }
    } else {
      if (!collection.findOne({_id:new Mongo.ObjectID(idType)}).isAdmin()) {
        throw new Meteor.Error("not-authorized");
      }
    }
    let retourUpload = apiCommunecter.postUploadPixel(type,idType,'newsImage',photo,str);
    if(retourUpload){
      let insertDoc = {};
      insertDoc.id = idType;
      insertDoc.type = type;
      insertDoc.folder = `${type}/${idType}/album`;
      insertDoc.moduleId = Meteor.settings.module;
      insertDoc.doctype = "image";
      insertDoc.name = retourUpload.name;
      insertDoc.size = retourUpload.size;
      //insertDoc.date = "";
      insertDoc.contentKey = "slider";
      insertDoc.formOrigin = "news";
      console.log(insertDoc);
      let  doc = apiCommunecter.postPixel("document","save",insertDoc);
      if(doc){
        //{"result":true,"msg":"Document bien enregistr\u00e9","id":{"$id":"58df810add04528643014012"},"name":"moon.png"}
        if(typeof newsId !== 'undefined'){
          const array = News.findOne({_id:new Mongo.ObjectID(newsId)});
          if(array && array.media && array.media.images && array.media.images.length > 0 ){
            console.log(array.media.images.length);
            let countImages = array.media.images.length + 1;
            News.update({_id:new Mongo.ObjectID(newsId)},{$set: { 'media.countImages': countImages.toString() }, $push: { 'media.images': doc.data.id["$id"] } });
            return {photoret:doc.data.id["$id"],newsId:newsId};
          }else{
            let media={};
            media["type"]="gallery_images";
            media["countImages"]="1";
            media["images"]=[doc.data.id["$id"]];
            News.update({_id:new Mongo.ObjectID(newsId)},{$set:{'media':media}});
            return {photoret:doc.data.id["$id"],newsId:newsId};
          }

        }else{
          let insertNew = {};
          insertNew.parentId=idType;
          insertNew.parentType=type;
          insertNew.text="photo";
          insertNew["media"]={};
          insertNew["media"]["type"]="gallery_images";
          insertNew["media"]["countImages"]="1";
          insertNew["media"]["images"]=[doc.data.id["$id"]];
          newsId = Meteor.call('insertNew',insertNew);
          if(newsId){
            return {photoret:doc.data.id["$id"],newsId:newsId.data.id["$id"]};
          }else{
            throw new Meteor.Error("photoNews error");
          }
        }

      }else{
        throw new Meteor.Error("insertDocument error");
      }
    }else{
      throw new Meteor.Error("postUploadPixel error");
    }
  },
  insertEvent (doc){
    SchemasEventsRest.clean(doc);
    check(doc, SchemasEventsRest);
    check(doc.organizerType, Match.Where(function(name) {
      return _.contains(['projects','organizations','citoyens'], name);
    }));
    console.log(doc);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(doc.organizerType === 'citoyens'){
      if (this.userId !== doc.organizerId ) {
        throw new Meteor.Error("not-authorized");
      }
    } else if(doc.organizerType === 'projects' || doc.organizerType === 'organizations'){
      const collection = nameToCollection(doc.organizerType);
      if (!collection.findOne({_id:new Mongo.ObjectID(doc.organizerId)}).isAdmin()) {
        throw new Meteor.Error("not-authorized");
      }
    }

    const docRetour = baseDocRetour({},doc,'events');
    docRetour.key='event';
    docRetour.collection='events';

    console.log(docRetour);

    var retour = apiCommunecter.postPixel("element","save",docRetour);
    return retour;
  },
  updateEvent (modifier,documentId){
    SchemasEventsRest.clean(modifier["$set"]);
    check(modifier["$set"], SchemasEventsRest);
    check(modifier["$set"].organizerType, Match.Where(function(name) {
      return _.contains(['projects','organizations','citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(modifier["$set"].organizerType === 'citoyens'){
      if (this.userId !== modifier["$set"].organizerId ) {
        throw new Meteor.Error("not-authorized");
      }
    } else if(modifier["$set"].organizerType === 'projects' || modifier["$set"].organizerType === 'organizations'){
      const collection = nameToCollection(modifier["$set"].organizerType);
      if (!collection.findOne({_id:new Mongo.ObjectID(modifier["$set"].organizerId)}).isAdmin()) {
        throw new Meteor.Error("not-authorized");
      }
    }
    if (!Events.findOne({_id:new Mongo.ObjectID(documentId)}).isAdmin()) {
      throw new Meteor.Error("not-authorized");
    }

    const docRetour = baseDocRetour({},modifier["$set"],'events');
    docRetour.id = documentId;
    docRetour.key='event';
    docRetour.collection='events';

    console.log(docRetour);

    var retour = apiCommunecter.postPixel("element","save",docRetour);
    return retour;
  },
  insertProject (doc){
    SchemasProjectsRest.clean(doc);
    check(doc, SchemasProjectsRest);
    check(doc.parentType, Match.Where(function(name) {
      return _.contains(['organizations','citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(doc.parentType === 'citoyens'){
      if (this.userId !== doc.parentId ) {
        throw new Meteor.Error("not-authorized");
      }
    } else if(doc.parentType === 'organizations'){
      const collection = nameToCollection(doc.parentType);
      if (!collection.findOne({_id:new Mongo.ObjectID(doc.parentId)}).isAdmin()) {
        throw new Meteor.Error("not-authorized");
      }
    }

    const docRetour = baseDocRetour({},doc,'projects');
    docRetour.key='project';
    docRetour.collection='projects';

    console.log(docRetour);

    var retour = apiCommunecter.postPixel("element","save",docRetour);
    return retour;
  },
  updateProject (modifier,documentId){
    SchemasProjectsRest.clean(modifier["$set"]);
    check(modifier["$set"], SchemasProjectsRest);
    check(modifier["$set"].parentType, Match.Where(function(name) {
      return _.contains(['organizations','citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(modifier["$set"].parentType === 'citoyens'){
      if (this.userId !== modifier["$set"].parentId ) {
        throw new Meteor.Error("not-authorized");
      }
    } else if(modifier["$set"].parentType === 'organizations'){
      const collection = nameToCollection(modifier["$set"].parentType);
      if (!collection.findOne({_id:new Mongo.ObjectID(modifier["$set"].parentId)}).isAdmin()) {
        throw new Meteor.Error("not-authorized");
      }
    }
    if (!Projects.findOne({_id:new Mongo.ObjectID(documentId)}).isAdmin()) {
      throw new Meteor.Error("not-authorized");
    }

    const docRetour = baseDocRetour({},modifier["$set"],'projects');
    docRetour.id = documentId;
    docRetour.key='project';
    docRetour.collection='projects';

    console.log(docRetour);

    var retour = apiCommunecter.postPixel("element","save",docRetour);
    return retour;
  },
  insertPoi (doc){
    SchemasPoiRest.clean(doc);
    check(doc, SchemasPoiRest);
    check(doc.parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(doc.parentType === 'citoyens'){
      if (this.userId !== doc.parentId ) {
        throw new Meteor.Error("not-authorized");
      }
    } else {
      const collection = nameToCollection(doc.parentType);
      if (!collection.findOne({_id:new Mongo.ObjectID(doc.parentId)}).isAdmin()) {
        throw new Meteor.Error("not-authorized");
      }
    }

    const docRetour = baseDocRetour({},doc,'poi');
    docRetour.key='poi';
    docRetour.collection='poi';

    console.log(docRetour);

    var retour = apiCommunecter.postPixel("element","save",docRetour);
    return retour;
  },
  updatePoi (modifier,documentId){
    SchemasPoiRest.clean(modifier["$set"]);
    check(modifier["$set"], SchemasPoiRest);
    check(modifier["$set"].parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(modifier["$set"].parentType === 'citoyens'){
      if (this.userId !== modifier["$set"].parentId ) {
        throw new Meteor.Error("not-authorized");
      }
    } else {
      const collection = nameToCollection(modifier["$set"].parentType);
      if (!collection.findOne({_id:new Mongo.ObjectID(modifier["$set"].parentId)}).isAdmin()) {
        throw new Meteor.Error("not-authorized");
      }
    }
    if (!Poi.findOne({_id:new Mongo.ObjectID(documentId)}).isAdmin()) {
      throw new Meteor.Error("not-authorized");
    }

    const docRetour = baseDocRetour({},modifier["$set"],'poi');
    docRetour.id = documentId;
    docRetour.key='poi';
    docRetour.collection='poi';

    console.log(docRetour);

    var retour = apiCommunecter.postPixel("element","save",docRetour);
    return retour;
  },
  insertClassified (doc){
    SchemasClassifiedRest.clean(doc);
    check(doc, SchemasClassifiedRest);
    check(doc.parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(doc.parentType === 'citoyens'){
      if (this.userId !== doc.parentId ) {
        throw new Meteor.Error("not-authorized");
      }
    } else {
      const collection = nameToCollection(doc.parentType);
      if (!collection.findOne({_id:new Mongo.ObjectID(doc.parentId)}).isAdmin()) {
        throw new Meteor.Error("not-authorized");
      }
    }

    const docRetour = baseDocRetour({},doc,'classified');
    docRetour.key='classified';
    docRetour.collection='classified';

    console.log(docRetour);

    var retour = apiCommunecter.postPixel("element","save",docRetour);
    return retour;
  },
  updateClassified (modifier,documentId){
    SchemasClassifiedRest.clean(modifier["$set"]);
    check(modifier["$set"], SchemasClassifiedRest);
    check(modifier["$set"].parentType, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens'], name);
    }));
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if(modifier["$set"].parentType === 'citoyens'){
      if (this.userId !== modifier["$set"].parentId ) {
        throw new Meteor.Error("not-authorized");
      }
    } else {
      const collection = nameToCollection(modifier["$set"].parentType);
      if (!collection.findOne({_id:new Mongo.ObjectID(modifier["$set"].parentId)}).isAdmin()) {
        throw new Meteor.Error("not-authorized");
      }
    }
    if (!Classified.findOne({_id:new Mongo.ObjectID(documentId)}).isAdmin()) {
      throw new Meteor.Error("not-authorized");
    }

    const docRetour = baseDocRetour({},modifier["$set"],'classified');
    docRetour.id = documentId;
    docRetour.key='classified';
    docRetour.collection='classified';

    console.log(docRetour);

    var retour = apiCommunecter.postPixel("element","save",docRetour);
    return retour;
  },
  photoScope (scope,photo,str,idType) {
    check(str, String);
    check(idType, String);
    check(scope, String);
    check(scope, Match.Where(function(name) {
      return _.contains(['events', 'projects','organizations','citoyens','poi','classified'], name);
    }));
    const collection = nameToCollection(scope);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (!collection.findOne({_id:new Mongo.ObjectID(idType)}).isAdmin()) {
      throw new Meteor.Error("not-authorized");
    }
    let retourUpload = apiCommunecter.postUploadPixel(scope,idType,'avatar',photo,str);
    if(retourUpload){
      let insertDoc = {};
      insertDoc.id = idType;
      insertDoc.type = scope;
      insertDoc.folder = `${scope}/${idType}`;
      insertDoc.moduleId = Meteor.settings.module;
      insertDoc.author = this.userId;
      insertDoc.doctype = "image";
      insertDoc.name = retourUpload.name;
      insertDoc.size = retourUpload.size;
      insertDoc.contentKey = "profil";
      let  doc = apiCommunecter.postPixel("document","save",insertDoc);
      //console.log(doc);
      if(doc){
        collection.update({_id:new Mongo.ObjectID(idType)},{$set:{
          'profilImageUrl':`/upload/communecter/${scope}/${idType}/${retourUpload.name}`,
          'profilThumbImageUrl':`/upload/communecter/${scope}/${idType}/thumb/profil-resized.png?=${new Date}${Math.floor((Math.random() * 100) + 1)}`,
          'profilMarkerImageUrl':`/upload/communecter/${scope}/${idType}/thumb/profil-marker.png?=${new Date}${Math.floor((Math.random() * 100) + 1)}`
        }});
        return doc.data.id["$id"];
      }else{
        throw new Meteor.Error("insertDocument error");
      }
    }else{
      throw new Meteor.Error("postUploadPixel error");
    }
  },
  insertOrganization (doc){
    SchemasOrganizationsRest.clean(doc);
    check(doc, SchemasOrganizationsRest);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    const docRetour = baseDocRetour({},doc,'organizations');
    docRetour.key='organization';
    docRetour.collection='organizations';

    console.log(docRetour);

    var retour = apiCommunecter.postPixel("element","save",docRetour);
    return retour;
  },
  updateOrganization (modifier,documentId){
    SchemasOrganizationsRest.clean(modifier["$set"]);
    check(modifier["$set"], SchemasOrganizationsRest);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    if (!Organizations.findOne({_id:new Mongo.ObjectID(documentId)}).isAdmin()) {
      throw new Meteor.Error("not-authorized");
    }

    const docRetour = baseDocRetour({},doc,'organizations');
    docRetour.id = documentId;
    docRetour.key='organization';
    docRetour.collection='organizations';

    console.log(docRetour);

    var retour = apiCommunecter.postPixel("element","save",docRetour);
    return retour;
  },
  createUserAccountRest (user){
    //console.log(user);
    check(user, Object);
    check(user.name, String);
    check(user.username, String);
    check(user.email, String);
    check(user.password, String);
    check(user.codepostal, String);
    check(user.city, String);

    var passwordTest = new RegExp("(?=.{8,}).*", "g");
    if (passwordTest.test(user.password) == false) {
      throw new Meteor.Error("Password is Too short");
    }

    if (!IsValidEmail(user.email)) {
      throw new Meteor.Error("Email not valid");
    }

    if (Citoyens.find({email: user.email}).count() !== 0) {
      throw new Meteor.Error("Email not unique");
    }

    if (Citoyens.find({username: user.username}).count() !== 0) {
      throw new Meteor.Error("Username not unique");
    }

    let insee = Cities.findOne({insee: user.city});

    try {
      var response = HTTP.call( 'POST', `${Meteor.settings.endpoint}/${Meteor.settings.module}/person/register`, {
        params: {
          "name": user.name,
          "email": user.email,
          "username" : user.username,
          "pwd": user.password,
          "cp": insee.cp,
          "city": insee.insee,
          "geoPosLatitude": insee.geo.latitude,
          "geoPosLongitude": insee.geo.longitude
        }
      });
      //console.log(response);
      if(response.data.result && response.data.id){
        let userId = response.data.id;
        return userId;
      }else{
        throw new Meteor.Error(response.data.msg);
      }
    } catch(e) {
      throw new Meteor.Error("Error server");
    }


  },
getcitiesbylatlng (latlng) {
  check(latlng, {latitude:Number,longitude:Number});
  Cities._ensureIndex({
    "geoShape": "2dsphere"
  });
  return Cities.findOne({"geoShape":
  {$geoIntersects:
    {$geometry:{ "type" : "Point",
    "coordinates" : [ latlng.longitude, latlng.latitude ] }
  }
}
},{_disableOplog: true});
},
getcitiesbypostalcode (cp) {
  check(cp, String);
  return Cities.find({'postalCodes.postalCode': cp}).fetch();
},
searchCities (query, options){
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
  var regex = new RegExp("^" + query);
  return Cities.find({$or : [{name: {$regex:  regex, $options: "i"}},{'postalCodes.postalCode': {$regex:  regex}}]}, options).fetch();
},
markRead (notifId) {
  check(notifId, String);
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  const notif = {};
  notif.id = notifId;
  var retour = apiCommunecter.postPixel("notification","marknotificationasread",notif);
  return retour;
},
markSeen (notifId) {
  check(notifId, String);
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  const notif = {};
  notif.id = notifId;
  var retour = apiCommunecter.postPixel("notification","update",notif);
  return retour;
},
alertCount (){
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  return ActivityStream.api.queryUnseen().count();
},
registerClick (notifId) {
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
},
allRead () {
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  const notif = {};
  notif.action = 'read';
  notif.all = true;
  var retour = apiCommunecter.postPixel("notification","update",notif);
  return retour;
},
allSeen () {
  if (!this.userId) {
    throw new Meteor.Error("not-authorized");
  }
  const notif = {};
  notif.action = 'seen';
  notif.all = true;
  var retour = apiCommunecter.postPixel("notification","update",notif);
  return retour;
},
isEmailValid: function(address) {
  check(address, String);

  // modify this with your key
  var result = HTTP.get('https://api.mailgun.net/v2/address/validate', {
    auth: 'api:'+Meteor.settings.mailgunpubkey,
    params: {address: address.trim()}
  });

  if (result.statusCode === 200) {
    // is_valid is the boolean we are looking for
    return result.data.is_valid;
  } else {
    // the api request failed (maybe the service is down)
    // consider giving the user the benefit of the doubt and return true
    return true;
  }
}
});

export const userLocale = new ValidatedMethod({
  name: 'userLocale',
  validate: new SimpleSchema({
    language: { type: String }
  }).validator(),
  run({ language }) {
    this.unblock();
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }
    console.log(language);
    if (Meteor.users.update({
      _id: this.userId
    }, {
      $set: {
        'profile.language': language
      }
    })) {
      return true;
    }

    return false;
  }
});
