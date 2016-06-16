News = new Meteor.Collection("news", {idGeneration : 'MONGO'});

this.Schemas = this.Schemas || {};


this.Schemas.NewsRest =   new SimpleSchema({
  text : {
    type : String
  },
  parentId : {
    type: String
  },
  parentType : {
    type: String
  },
  tags : {
    type: [String],
    optional: true
  },
  media : {
    type: Object,
    optional: true
  },
  "media.type" : {
    type: String,
    optional: true
  },
  "media.content" : {
    type: Object,
    optional: true
  },
  "media.content.type" : {
    type: String,
    optional: true
  },
  "media.content.image" : {
    type: String,
    optional: true
  },
  "media.content.imageId" : {
    type: String,
    optional: true
  },
  "media.content.imageSize" : {
    type: String,
    optional: true
  },
  "media.content.videoLink" : {
    type: String,
    optional: true
  },
  "media.content.url" : {
    type: String,
    optional: true
  }
});


this.Schemas.News =   new SimpleSchema({
  text : {
    type : String,
    optional: true
  },
  tags : {
    type: [String],
    optional: true
  },
  media : {
    type: Object,
    optional: true
  },
  "media.type" : {
    type: String,
    optional: true
  },
  "media.content" : {
    type: Object,
    optional: true
  },
  "media.content.type" : {
    type: String,
    optional: true
  },
  "media.content.image" : {
    type: String,
    optional: true
  },
  "media.content.imageId" : {
    type: String,
    optional: true
  },
  "media.content.imageSize" : {
    type: String,
    optional: true
  },
  "media.content.videoLink" : {
    type: String,
    optional: true
  },
  "media.content.url" : {
    type: String,
    optional: true
  }
});

Meteor.startup(function() {
  //this.Schemas.News.i18n("schemas.news");
  News.attachSchema(this.Schemas.News);
});

News.helpers({
  authorNews: function () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(this.author)});
  },
  photoNews: function () {
    if(this.media && this.media.content && this.media.content.imageId){
    return Photosimg.find({_id:this.media.content.imageId});
  }
  },
  likesCount : function () {
    if (this.voteUp && this.voteUpCount) {
      return this.voteUpCount;
    }
    return 0;
  },
  dislikesCount : function () {
    if (this.voteDown && this.voteDownCount) {
      return this.voteDownCount;
    }
    return 0;
  },
  isAuthor () {
    return this.author === Meteor.userId();
  }
});
