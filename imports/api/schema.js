import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

SimpleSchema.debug = true;

export const Countries_SELECT = ["FR","GP","MQ","YT","NC","RE"];
export const Countries_SELECT_LABEL = [{label : "France",value: "FR"},{label:"Guadeloupe",value:"GP"},{label:"Guyanne Française",value:"GF"},{label:"Martinique",value:"MQ"},{label:"Mayotte",value:"YT"},{label:"Nouvelle-Calédonie",value:"NC"},{label:"Réunion",value:"RE"},{label:"St Pierre et Miquelon",value:"PM"}];

export const roles_SELECT = ["admin","member","creator"];
export const roles_SELECT_LABEL = [{label : "Administrateur",value: "admin"},{label:"Membre",value:"member"},{label:"Juste un citoyen qui veut faire connaître cette organisation",value:"creator"}];

export const avancements_SELECT = ["idea","concept","started","development","testing","mature"];
export const avancements_SELECT_LABEL = [{label : "idea",value: "idea"},{label:"concept",value:"concept"},{label:"started",value:"started"},{label:"development",value:"development"},{label:"testing",value:"testing"},{label:"mature",value:"mature"}];

export const preferences_SELECT = ["public","private","hide"];

export const blockBaseSchema = new SimpleSchema({
typeElement : {
type : String
},
block : {
type : String
}
});

export const preferences = new SimpleSchema({
  isOpenData : {
    type : Boolean,
    autoValue: function() {
      if (this.isSet) {
        console.log(this.value);
        return this.value;
      } else {
        return true;
      }
    },
    optional:true
  },
  isOpenEdition: {
    type : Boolean,
    autoValue: function() {
      if (this.isSet) {
        console.log(this.value);
        return this.value;
      } else {
        return true;
      }
    },
    optional:true
  }
});


export const baseSchema = new SimpleSchema({
  name : {
    type : String
  },
  shortDescription : {
    type : String,
    max: 140,
    optional: true
  },
  description : {
    type : String,
    optional: true
  },
  url : {
    type : String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  tags : {
    type : [String],
    optional: true
  },
  preferences : {
    type: preferences,
    optional:true
  }
});

export const geoSchema = new SimpleSchema({
  country : {
    type : String,
    min: 1
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
  regionName: {
    type : String,
    autoform: {
      type: "hidden"
    }
  },
  depName: {
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
  }
});

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


export const PostalAddress = new SimpleSchema({
  addressLocality: {
    type : String
  },
  streetAddress: {
    type : String,
    optional: true
  },
  addressCountry: {
    type : String
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
  },
  depName: {
    type : String,
    optional: true
  },
  regionName: {
    type : String,
    optional: true
  }
});
