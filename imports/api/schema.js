import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

//SimpleSchema.debug = true;

export const GeoCoordinates = new SimpleSchema({
  longitude: {
    type: Number,
    decimal: true
  },
  latitude: {
    type: Number,
    decimal: true
  }
});

export const GeoPosition = new SimpleSchema({
  type : {
    type : String,
    allowedValues: ['Point'],
    optional: true
  },
  coordinates: {
    type: [Number],
    decimal: true,
    optional: true
  }
});


export const Countries_SELECT = ["FR","GP","MQ","YT","NC","RE"];
export const Countries_SELECT_LABEL = [{label : "France",value: "FR"},{label:"Guadeloupe",value:"GP"},{label:"Guyanne Française",value:"GF"},{label:"Martinique",value:"MQ"},{label:"Mayotte",value:"YT"},{label:"Nouvelle-Calédonie",value:"NC"},{label:"Réunion",value:"RE"},{label:"St Pierre et Miquelon",value:"PM"}];

export const roles_SELECT = ["admin","member","creator"];
export const roles_SELECT_LABEL = [{label : "Administrateur",value: "admin"},{label:"Membre",value:"member"},{label:"Juste un citoyen qui veut faire connaître cette organisation",value:"creator"}];

export const PostalAddress = new SimpleSchema({
  addressLocality: {
    type : String
  },
  streetAddress: {
    type : String,
    optional: true
  },
  addressCountry: {
    type : String,
    allowedValues: Countries_SELECT,
    autoform: {
      type: "select",
      options: Countries_SELECT_LABEL,
    }
  },
  postalCode: {
    type : String,
    min:5,
    max:9
  },
  codeInsee: {
    type : String,
    autoform: {
      type: "select"
    }
  }
});

export const linksCitoyens = new SimpleSchema({
  knows : {
    type: [Object],
    optional:true
  },
  memberOf : {
    type: [Object],
    optional:true
  },
  events : {
    type: [Object],
    optional:true
  },
  projects : {
    type: [Object],
    optional:true
  },
  needs : {
    type: [Object],
    optional:true
  }
});

export const linksOrganizations = new SimpleSchema({
  knows : {
    type: [Object],
    optional:true
  },
  memberOf : {
    type: [Object],
    optional:true
  },
  members : {
    type: [Object],
    autoValue: function() {
      if (this.isInsert) {
        let members = {};
        members[Meteor.userId()] = {"type":"citoyens","isAdmin":true};
        console.log(members);
        return members;
      } else if (this.isUpsert) {
        let members = {};
        members[Meteor.userId()] = {"type":"citoyens","isAdmin":true};
        return {
          $setOnInsert: members
        };
      } else {
        this.unset();
      }
    },
    denyUpdate: true
  },
  events : {
    type: [Object],
    optional:true
  },
  projects : {
    type: [Object],
    optional:true
  },
  needs : {
    type: [Object],
    optional:true
  }
});
