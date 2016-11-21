import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { _ } from 'meteor/underscore';
import { moment } from 'meteor/momentjs:moment';
import { Router } from 'meteor/iron:router';

export const Orgas = new Meteor.Collection("organizations", {idGeneration : 'MONGO'});

//schemas
import { Countries_SELECT,Countries_SELECT_LABEL,PostalAddress,GeoCoordinates,GeoPosition } from './schema.js'

//collection
import { Lists } from './lists.js'

export const SchemasOrgasRest = new SimpleSchema({
    name : {
      type : String
    },
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
    country : {
      type : String,
      allowedValues: Countries_SELECT,
      autoform: {
        type: "select",
        options: Countries_SELECT_LABEL,
      }
    },
    streetAddress: {
      type : String,
      optional: true
    },
    postalCode: {
      type : String,
      min:5,
      max:9
    },
    city: {
      type : String,
      autoform: {
        type: "select"
      }
    },
    cityName: {
      type : String,
      autoform: {
        type: "hidden"
      }
    },
    geoPosLatitude: {
      type: Number,
      decimal: true,
      optional:true
    },
    geoPosLongitude: {
      type: Number,
      decimal: true,
      optional:true
    },
    description : {
      type : String,
      autoform: {
        type: "textarea"
      }
    }
  });

let linksOrgas = new SimpleSchema({
  events : {
    type: [Object],
    optional:true
  },
  members : {
    type: [Object],
    optional:true
  },
  organizer : {
    type: [Object],
    optional:true
  },
  needs : {
    type: [Object],
    optional:true
  }
});


export const SchemasOrgas = new SimpleSchema({
    name : {
      type : String
    },
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
    address : {
      type : PostalAddress
    },
    geo : {
      type : GeoCoordinates
    },
    geoPosition : {
      type : GeoPosition
    },
    description : {
      type : String,
      autoform: {
        type: "textarea"
      }
    },
    tags : {
      type : [String]
    },
    email : {
      type : String,
      regEx: SimpleSchema.RegEx.Email
    },
    links : {
      type : linksOrgas,
      optional:true
    },
    profilImageUrl : {
      type : String,
      optional:true
    },
    profilThumbImageUrl : {
      type : String,
      optional:true
    },
    profilMarkerImageUrl : {
      type : String,
      optional:true
    },
    profilMediumImageUrl : {
      type : String,
      optional:true
    },
    creator : {
      type: String,
      autoValue: function() {
        if (this.isInsert) {
          return Meteor.userId();
        } else if (this.isUpsert) {
          return {
            $setOnInsert: Meteor.userId()
          };
        } else {
          this.unset();
        }
      },
      denyUpdate: true
    },
    created: {
      type: Date,
      autoValue: function() {
        if (this.isInsert) {
          return new Date();
        } else if (this.isUpsert) {
          return {
            $setOnInsert: new Date()
          };
        } else {
          this.unset();
        }
      },
      denyUpdate: true
    }
  });

  Orgas.attachSchema(
    SchemasOrgas
  );

  Orgas.allow({
    insert: function (userId, doc) {
      return (userId && doc.creator === userId);
    },
    update: function (userId, doc, fields, modifier) {
      return doc.creator === userId;
    },
    remove: function (userId, doc) {
      return doc.creator === userId;
    },
    fetch: ['creator']
  });

  Orgas.deny({
    update: function (userId, docs, fields, modifier) {
      return _.contains(fields, 'creator');
    }
  });


//if(Meteor.isClient){
  //collection
  import { News } from './news.js'
  import { Citoyens } from './citoyens.js';

  Orgas.helpers({
    creatorProfile () {
      return Citoyens.findOne({_id:new Mongo.ObjectID(this.creator)});
    },
    isCreator () {
      return this.creator === Meteor.userId();
    },
    isAdmin () {
      return this.links && this.links.members && this.links.members[Meteor.userId()] && this.links.members[Meteor.userId()].isAdmin;
    },
    isMembers (){
          return this.links && this.links.members && this.links.members[Meteor.userId()];
    },
    listMembers (){
      if(this.links && this.links.members){
        let attendees = _.map(this.links.members, function(attendees,key){
           return new Mongo.ObjectID(key);
         });
          return Citoyens.find({_id:{$in:attendees}},{sort: {"name": 1} });
      } else{
        return false;
      }
    },
    countMembers () {
      return this.links && this.links.members && _.size(this.links.members);
    },
    isStart () {
      let start = moment(this.startDate).toDate();
      let now = moment().toDate();
      return moment(start).isBefore(now); // True
    },
    news () {
      return News.find({'target.id':Router.current().params._id},{sort: {"created": -1},limit: Session.get('limit') });
    },
    new () {
      return News.findOne({_id:new Mongo.ObjectID(Router.current().params.newsId)});
    }
  });

//}
