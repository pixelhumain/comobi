import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

export const Organizations = new Meteor.Collection("organizations", {idGeneration : 'MONGO'});

//schemas
import { baseSchema,blockBaseSchema,geoSchema,roles_SELECT,roles_SELECT_LABEL,preferences } from './schema.js'

//collection
import { Lists } from './lists.js'

//SimpleSchema.debug = true;

export const SchemasOrganizationsRest = new SimpleSchema([baseSchema,geoSchema,{
    type : {
      type : String,
      autoform: {
        type: "select",
        options: function () {
          if (Meteor.isClient) {
            let listSelect = Lists.findOne({name:'organisationTypes'});
            if(listSelect && listSelect.list){
              return _.map(listSelect.list,function (value,key) {
                return {label: value, value: key};
              });
            }
          }
        }
      }
    },
    role: {
      type : String,
      min: 1,
      denyUpdate: true
    },
    email : {
      type : String,
      regEx: SimpleSchema.RegEx.Email,
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
    }
  }]);

  export const BlockOrganizationsRest = {};
  BlockOrganizationsRest.descriptions = new SimpleSchema([blockBaseSchema,baseSchema.pick(['shortDescription','description','tags','tags.$'])]);
  BlockOrganizationsRest.info = new SimpleSchema([blockBaseSchema,baseSchema.pick(['name','url']),SchemasOrganizationsRest.pick(['type','email','fixe','mobile','fax'])]);
  BlockOrganizationsRest.network = new SimpleSchema([blockBaseSchema,{
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
  BlockOrganizationsRest.locality = new SimpleSchema([blockBaseSchema,geoSchema]);
  BlockOrganizationsRest.preferences = new SimpleSchema([blockBaseSchema,{
    preferences : {
      type: preferences,
      optional:true
    }
  }]);
//if(Meteor.isClient){
  //collection
  import { News } from './news.js'
  import { Citoyens } from './citoyens.js';
  import { Documents } from './documents.js';
  import { Events } from './events.js';
  import { Projects } from './projects.js';
  import { Poi } from './poi.js';
  import { ActivityStream } from './activitystream.js';
  import { queryLink,queryLinkType,arrayLinkType,queryLinkToBeValidated,arrayLinkToBeValidated,queryOptions } from './helpers.js';

  Organizations.helpers({
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
    isFavorites (userId) {
      let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
      return Citoyens.findOne({_id:new Mongo.ObjectID(bothUserId)}).isFavorites('organizations',this._id._str);
    },
    isAdmin (userId) {
      let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
      return (this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].isAdmin && this.isToBeValidated(bothUserId)) ? true : false;
    },
    isToBeValidated (userId) {
      let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
      return (this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].toBeValidated) ? false : true;
    },
    toBeValidated (userId) {
      let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
      return (this.links && this.links.members && this.links.members[bothUserId] && this.links.members[bothUserId].toBeValidated) ? true : false;
    },
    listMembersToBeValidated (){
      if(this.links && this.links.members){
        const query = queryLinkToBeValidated(this.links.members);
          return Citoyens.find(query,queryOptions);
      } else{
        return false;
      }
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
    isFollows (followId){
      return (this.links && this.links.follows && this.links.follows[followId]) ? true : false;
    },
    isFollowsMe (){
      return (this.links && this.links.follows && this.links.follows[Meteor.userId()]) ? true : false;
    },
    listFollows (search){
      if(this.links && this.links.follows){
        const query = queryLink(this.links.follows,search);
          return Citoyens.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countFollows () {
      //return this.links && this.links.follows && _.size(this.links.follows);
      return this.listFollows(search) && this.listFollows(search).count();
    },
    isFollowers (followId){
      return (this.links && this.links.followers && this.links.followers[followId]) ? true : false;
    },
    isFollowersMe (){
      return (this.links && this.links.followers && this.links.followers[Meteor.userId()]) ? true : false;
    },
    listFollowers (search){
      if(this.links && this.links.followers){
         const query = queryLink(this.links.followers,search);
          return Citoyens.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countFollowers (search) {
      //return this.links && this.links.followers && _.size(this.links.followers);
      return this.listFollowers(search) && this.listFollowers(search).count();
    },
    isMembers (userId){
      let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
      return (this.links && this.links.members && this.links.members[bothUserId] && this.isToBeValidated(bothUserId)) ? true : false;
    },
    listEvents (search){
      if(this.links && this.links.events){
         const query = queryLink(this.links.events,search);
          return Events.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countEvents (search) {
      //return this.links && this.links.events && _.size(this.links.events);
      return this.listEvents(search) && this.listEvents(search).count();
    },
    listProjects (search){
      if(this.links && this.links.projects){
         const query = queryLink(this.links.projects,search);
          return Projects.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countProjects (search) {
      //return this.links && this.links.projects && _.size(this.links.projects);
      return this.listProjects(search) && this.listProjects(search).count();
    },
    listMembers (search){
      if(this.links && this.links.members){
        const query = queryLinkType(this.links.members,search,'citoyens');
          return Citoyens.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countMembers (search) {
      /*if(this.links && this.links.members){
      let members = arrayLinkType(this.links.members,'citoyens');
      return members && _.size(members);
      }*/
      return this.listMembers(search) && this.listMembers(search).count();
    },
    listMembersOrganizations (search,selectorga){
      if(this.links && this.links.members){
        const query = queryLinkType(this.links.members,search,'organizations',selectorga);
          return Organizations.find(query,queryOptions);
      } else{
        return false;
      }
    },
    countMembersOrganizations (search,selectorga) {
      /*if(this.links && this.links.members){
      let members = arrayLinkType(this.links.members,'organizations');
      return members && _.size(members);}*/
      return this.listMembersOrganizations(search,selectorga) && this.listMembersOrganizations(search,selectorga).count();
    },
    listProjectsCreator (){
      let query = {};
      query['parentId'] = this._id._str;
      return Projects.find(query,queryOptions);
    },
    countProjectsCreator () {
      return this.listProjectsCreator() && this.listProjectsCreator().count();
    },
    listPoiCreator (){
      let query = {};
      query['parentId'] = this._id._str;
      return Poi.find(query,queryOptions);
    },
    countPoiCreator () {
      return this.listPoiCreator() && this.listPoiCreator().count();
    },
    listEventsCreator (){
      let query = {};
      query['organizerId'] = this._id._str;
      return Events.find(query,queryOptions);
    },
    countEventsCreator () {
      //return this.links && this.links.events && _.size(this.links.events);
      return this.listEventsCreator() && this.listEventsCreator().count();
    },
    listNotifications (userId){
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
  	return ActivityStream.api.isUnseen(bothUserId,this._id._str);
    },
    listNotificationsAsk (userId){
    let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
  	return ActivityStream.api.isUnseenAsk(bothUserId,this._id._str);
    },
    countPopMap () {
      return this.links && this.links.members && _.size(this.links.members);
    },
    typeValue (){
      return Lists.findOne({name:'organisationTypes'}).list[this.type];
    },
    listOrganisationTypes (){
        return Lists.find({name:'organisationTypes'});
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
      if (this.isMembers(bothUserId)) {
        scopeTypeArray.push('private');
        query['$or'].push({'target.id':targetId,'scope.type':{$in:scopeTypeArray}});
        query['$or'].push({'mentions.id':targetId});
      }else{
        query['$or'].push({'target.id':targetId, $or: [{'scope.type':{$in:scopeTypeArray}},{'author':bothUserId}]});
        query['$or'].push({'mentions.id':targetId,'scope.type':{$in:scopeTypeArray}});
      }
      return News.find(query,options);
    },
    new () {
      return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
    }
  });

//}
