//Person
Citoyens = new Meteor.Collection("citoyens", {idGeneration : 'MONGO'});

//Social
var socialNetwork = new SimpleSchema({
  facebook: {
    type : String,
    optional: true
  },
  twitter: {
    type : String,
    optional: true
  },
  github: {
    type : String,
    optional: true
  },
  skype: {
    type : String,
    optional: true
  }
});

//Preferences
var preferencesCitoyen = new SimpleSchema({
  bgClass: {
    type : String,
    optional: true
  },
  bgUrl: {
    type : String,
    optional: true
  }
});

//Roles
var rolesCitoyen = new SimpleSchema({
  tobeactivated: {
    type : Boolean,
    defaultValue:true
  },
  betaTester: {
    type : Boolean,
    defaultValue:false
  },
  standalonePageAccess: {
    type : Boolean,
    defaultValue: true
  },
  superAdmin: {
    type : Boolean,
    defaultValue: false
  }
});

//TODO recuperer l'image du profil pour avatar
//profilImageUrl

Citoyens.attachSchema(
  new SimpleSchema({
    name : {
      type : String
    },
    username : {
      type : String,
      unique: true
    },
    email : {
      type : String,
      regEx: SimpleSchema.RegEx.Email,
      unique: true
    },
    pwd : {
      type : String
    },
    birthDate: {
      type: Date,
      optional: true
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
    socialNetwork : {
      type : socialNetwork,
      optional: true
    },
    shortDescription : {
      type : String,
      optional: true
    },
    telephone: {
      type : String,
      optional: true
    },
    preferences : {
      type : preferencesCitoyen,
      optional: true
    },
    roles : {
      type : rolesCitoyen
    },
    links : {
      type : linksCitoyens,
      optional:true
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
  }));

  Citoyens.helpers({
    isFollows (followId){
          return this.links && this.links.follows && this.links.follows[followId];
    },
    knows () {
      //this.links.knows
      if(this && this.links && this.links.knows){
        let knowsIds = _.map(this.links.knows, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        return Citoyens.find({_id:{$in:knowsIds}});
      }
    },
    countKnows () {
      if(this && this.links && this.links.knows){
        let knowsIds = _.map(this.links.knows, function(num, key){
          let objectId = new Mongo.ObjectID(key);
          return objectId;
        });
        return Citoyens.find({_id:{$in:knowsIds}}).count();
      }
    }
  });
