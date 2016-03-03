News = new Meteor.Collection("news", {idGeneration : 'MONGO'});

//quel sont les types ?

News.attachSchema(
  new SimpleSchema({
    name : {
      type : String,
      optional: true
    },
    text : {
      type : String,
      optional: true
    },
    date: {
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
    id : {
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
    },
    type : {
      type: String
    },
    tags : {
      type: [String],
      optional: true
    },
    likes : {
      type: [String],
      optional: true
    },
    scope : {
      type: Object
    },
    "scope.events" : {
      type: [String],
      optional: true
    },
    "scope.projects" : {
      type: [String],
      optional: true
    },
    "scope.organizations" : {
      type: [String],
      optional: true
    },
    "scope.citoyens" : {
      type: [String],
      optional: true
    }
  })
);

News.helpers({
  authorNews: function () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(this.author)});
  },
  docNews: function () {
    return Documents.findOne({id:this._id._str});
  },
  likesCount : function () {
    if (this.likes && this.likes.length) {
      return this.likes.length;
    }
    return 0;
  },
  isAuthor () {
    return this.author === Meteor.userId();
  }
});
