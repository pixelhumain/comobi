Documents = new Meteor.Collection("documents", {idGeneration : 'MONGO'});

//les champs collection,objId sont pour Meteor indique la collection et l'id à aller chercher pour avoir l'image coté php
//cfs.photosimg.filerecord
//contentKey  ex : event.news
//il y a quoi dans category ?

Documents.attachSchema(
  new SimpleSchema({
    id : {
      type : String,
    },
    type : {
      type : String,
      allowedValues: ['events','projects','citoyens','organizations']
    },
    folder : {
      type : String
    },
    objId : {
      type : String
    },
    moduleId : {
      type : String,
      defaultValue : 'communevent'
    },
    doctype : {
      type : String,
      allowedValues: ['image']
    },
    name : {
      type : String
    },
    size : {
      type : Number,
      optional : true
    },
    contentKey : {
      type : String,
      optional : true
    },
    category : {
      type : String,
      optional : true
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
    },
    author : {
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
    }
}));

Documents.helpers({
  photoNews: function () {
    return Photosimg.find({_id:this.objId});
  }
});
