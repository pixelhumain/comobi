import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

export const Events = new Meteor.Collection("events", {idGeneration : 'MONGO'});

//schemas
import { baseSchema,blockBaseSchema,geoSchema,Countries_SELECT,Countries_SELECT_LABEL,preferences } from './schema.js'

//collection
import { Lists } from './lists.js'
import { Citoyens } from './citoyens.js';
import { Organizations } from './organizations.js';
import { Projects } from './projects.js';
//SimpleSchema.debug = true;

export const SchemasEventsRest = new SimpleSchema([baseSchema,geoSchema, {
    type : {
      type : String,
      autoform: {
        type: "select",
        options: function () {
          if (Meteor.isClient) {
            let listSelect = Lists.findOne({name:'eventTypes'});
            if(listSelect && listSelect.list){
              return _.map(listSelect.list,function (value,key) {
                return {label: value, value: key};
              });
            }
          }
        }
      }
    },
    allDay : {
      type : Boolean,
      defaultValue:false
    },
    startDate : {
      type : Date
    },
    endDate : {
      type : Date
    },
    email : {
      type : String,
      optional: true
    },
    fixe : {
      type : String,
      optional: true
    },
    mobile : {
      type : String,
      optional: true
    },
    fax : {
      type : String,
      optional: true
    },
    organizerId : {
      type: String,
      autoform: {
        type: "select"
      }
    },
    organizerType : {
      type: String,
      autoform: {
        type: "select"
      }
    },
    parentId : {
      type: String,
      optional: true,
      autoform: {
        type: "select"
      }
    }
  }]);

  export const BlockEventsRest = {};
  BlockEventsRest.descriptions = new SimpleSchema([blockBaseSchema,baseSchema.pick(['shortDescription','description'])]);
  BlockEventsRest.info = new SimpleSchema([blockBaseSchema,baseSchema.pick(['name','tags','tags.$','url']),SchemasEventsRest.pick(['type','email','fixe','mobile','fax'])]);
  BlockEventsRest.network = new SimpleSchema([blockBaseSchema,{
    github : {
      type : String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    },
    instagram : {
      type : String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    },
    skype : {
      type : String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    },
    gpplus : {
      type : String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    },
    twitter : {
      type : String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    },
    facebook : {
      type : String,
      regEx: SimpleSchema.RegEx.Url,
      optional: true
    }
  }]);
  BlockEventsRest.when = new SimpleSchema([blockBaseSchema,SchemasEventsRest.pick(['allDay','startDate','endDate'])]);
  BlockEventsRest.locality = new SimpleSchema([blockBaseSchema,geoSchema]);
  BlockEventsRest.preferences = new SimpleSchema([blockBaseSchema,{
    preferences : {
      type: preferences,
      optional:true
    }
  }]);

//if(Meteor.isClient){
  //collection
  import { News } from './news.js'
  import { Documents } from './documents.js';
  import { ActivityStream } from './activitystream.js';
  import { queryLink,queryLinkType,arrayLinkType,queryOptions,nameToCollection } from './helpers.js';

  if(Meteor.isClient){
    window.Organizations = Organizations;
    window.Projects = Projects;
    window.Citoyens = Citoyens;
  }

  Events.helpers({
    isVisibleFields (field){
      /*if(this.isMe()){
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
      }*/
      return true;
    },
    isPublicFields (field){
       return this.preferences && this.preferences.publicFields && _.contains(this.preferences.publicFields, field);
    },
    isPrivateFields (field){
      return this.preferences && this.preferences.privateFields && _.contains(this.preferences.privateFields, field);
    },
    organizerEvent (){
      if(this.organizerType && this.organizerId && _.contains(['events', 'projects','organizations','citoyens'], this.organizerType)){
      let collectionType = nameToCollection(this.organizerType);
      return collectionType.findOne({
        _id: new Mongo.ObjectID(this.organizerId)
      }, {
        fields: {
          'name': 1
        }
      });
    }
    },
    documents (){
    return Documents.find({
      id : this._id._str,
      contentKey : "profil"
    },{sort: {"created": -1},limit: 1 });
    },
    creatorProfile () {
      return Citoyens.findOne({_id:new Mongo.ObjectID(this.creator)});
    },
    isCreator () {
      return this.creator === Meteor.userId();
    },
    isAdmin (userId) {
      let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
      return (this.links && this.links.attendees && this.links.attendees[bothUserId] && this.links.attendees[bothUserId].isAdmin) ? true : false;
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
    isAttendees (userId){
      let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
      return (this.links && this.links.attendees && this.links.attendees[bothUserId]) ? true : false;
    },
    listAttendees (search){
      if(this.links && this.links.attendees){
        const query = queryLink(this.links.attendees,search);
          return Citoyens.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countAttendees () {
      return this.links && this.links.attendees && _.size(this.links.attendees);
    },
    listNotifications (){
    return ActivityStream.api.isUnread(this._id._str);
    },
    listNotificationsAsk (){
    return ActivityStream.api.isUnreadAsk(this._id._str);
    },
    countPopMap () {
      return this.links && this.links.attendees && _.size(this.links.attendees);
    },
    isStart () {
      let start = moment(this.startDate).toDate();
      let now = moment().toDate();
      return moment(start).isBefore(now); // True
    },
    typeValue (){
      return Lists.findOne({name:'eventTypes'}).list[this.type];
    },
    listEventTypes (){
        return Lists.find({name:'eventTypes'});
    },
    newsJournal (target,userId,limit) {
      const query = {};
      const options = {};
      options['sort'] = {"created": -1};
      query['$or'] = [];
      let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
      let targetId = (typeof target !== 'undefined') ? target : Router.current().params._id;
      if(Meteor.isClient){
        let bothLimit = Session.get('limit');
      }else{
        if(typeof limit !== 'undefined'){
          options['limit'] = limit;
        }
      }
      let scopeTypeArray = ['public','restricted'];
      if (this.isAdmin(bothUserId)) {
        scopeTypeArray.push('private');
      }
      query['$or'].push({'target.id':targetId,'scope.type':{$in:scopeTypeArray}});
      query['$or'].push({'mentions.id':targetId,'scope.type':{$in:scopeTypeArray}});
      if(bothUserId){
        //query['$or'].push({'author':bothUserId});
      }
      return News.find(query,options);
    },
    new () {
      return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
    }
  });

//}
