import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const NotificationHistory = new Mongo.Collection("notification_history");

if(Meteor.isClient){
  //collection
  import { News } from './news.js'
  import { Citoyens } from './citoyens.js'
  
NotificationHistory.helpers({
  authorNotify : function () {
    return Citoyens.findOne({_id:new Mongo.ObjectID(this.author)});
  },
  news : function () {
    return News.findOne({_id:new Mongo.ObjectID(this.newsId)})
  },
});

}
