import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

export const Poi = new Meteor.Collection("poi", {idGeneration : 'MONGO'});

//schemas
import { baseSchema,blockBaseSchema,geoSchema,preferences } from './schema.js'

//collection
import { Lists } from './lists.js'

//SimpleSchema.debug = true;

export const SchemasPoiRest = new SimpleSchema([baseSchema,geoSchema,{
  type : {
    type : String,
    autoform: {
      type: "select"
    }
  },
    parentType : {
      type: String,
      autoform: {
        type: "select"
      }
    },
    parentId : {
      type: String,
      autoform: {
        type: "select"
      }
    }
  }]);

  export const BlockPoiRest = {};
  BlockPoiRest.descriptions = new SimpleSchema([blockBaseSchema,baseSchema.pick(['shortDescription','description','tags','tags.$'])]);
  BlockPoiRest.info = new SimpleSchema([blockBaseSchema,baseSchema.pick(['name'])]);
  BlockPoiRest.locality = new SimpleSchema([blockBaseSchema,geoSchema]);


//if(Meteor.isClient){
  //collection
  import { News } from './news.js'
  import { Citoyens } from './citoyens.js';
  import { Organizations } from './organizations.js';
  import { Documents } from './documents.js';
  import { Events } from './events.js';
  import { Projects } from './projects.js';
  import { ActivityStream } from './activitystream.js';
  import { queryLink,queryLinkType,arrayLinkType,queryLinkToBeValidated,arrayLinkToBeValidated,queryOptions,nameToCollection } from './helpers.js';

  if(Meteor.isClient){
    window.Organizations = Organizations;
    window.Citoyens = Citoyens;
    window.Projects = Projects;
    window.Events = Events;
  }

  Poi.helpers({
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
    organizerPoi (){
      if(this.parentId && this.parentType && _.contains(['events', 'projects','organizations','citoyens'], this.parentType)){
        console.log(this.parentType);
      let collectionType = nameToCollection(this.parentType);
      return collectionType.findOne({
        _id: new Mongo.ObjectID(this.parentId)
      }, {
        fields: {
          'name': 1,
          'links': 1
        }
      });
    }
    },
    creatorProfile () {
      return Citoyens.findOne({_id:new Mongo.ObjectID(this.creator)});
    },
    isCreator () {
      return this.creator === Meteor.userId();
    },
    isFavorites (userId) {
      let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
      return Citoyens.findOne({_id:new Mongo.ObjectID(bothUserId)}).isFavorites('poi',this._id._str);
    },
    isAdmin (userId) {
      let bothUserId = (typeof userId !== 'undefined') ? userId : Meteor.userId();
      if(bothUserId && this.parentId && this.parentType && _.contains(['events', 'projects','organizations','citoyens'], this.parentType)){
        if(this.parentType === 'citoyens'){
          return (this.parentId === bothUserId) ? true : false;
        }else{
          //console.log(this.organizerPoi());
          return this.organizerPoi() && this.organizerPoi().isAdmin(bothUserId);
        }
    }
    },
    scopeVar () {
      return 'poi';
    },
    scopeEdit () {
      return 'poiEdit';
    },
    listScope () {
      return 'listPoi';
    }
  });

//}
